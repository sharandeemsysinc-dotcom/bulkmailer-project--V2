import React, { useState, useEffect } from 'react';
import api from '../api';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const TemplatePage = () => {
  const [templates, setTemplates] = useState([]);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ id: '', name: '', subject: '', content: '' });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // ✅ Fetch All Templates
  const getAllTemplates = async () => {
    try {
      const res = await api.post('/template/getAllTemplate', { page: 1, itemsPerPage: 10 });
      if (res.data?.status) {
        setTemplates(res.data.data || []);
      } else {
        setSnackbar({ open: true, message: res.data?.message || 'Failed to load templates.', severity: 'error' });
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setSnackbar({ open: true, message: 'Error fetching templates.', severity: 'error' });
    }
  };

  // ✅ Get Template By ID
  const getTemplateById = async (template_id) => {
    try {
      const res = await api.get(`/template/get/${template_id}`);
      if (res.data?.status) {
        const data = res.data.data;
        setNewTemplate({
          id: data.id,
          name: data.name,
          subject: data.subject,
          content: data.content,
        });
        setEditMode(true);
        setOpen(true);
        setSnackbar({ open: true, message: 'Template loaded successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: res.data?.message || 'Failed to load template.', severity: 'error' });
      }
    } catch (err) {
      console.error('Error fetching template by ID:', err);
      setSnackbar({ open: true, message: 'Error fetching template details.', severity: 'error' });
    }
  };

  useEffect(() => {
    getAllTemplates();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setNewTemplate({ id: '', name: '', subject: '', content: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTemplate({ id: '', name: '', subject: '', content: '' });
    setEditMode(false);
  };

  // ✅ Confirm Delete
  const handleConfirmDelete = (id) => {
    setSelectedTemplateId(id);
    setConfirmOpen(true);
  };

  // ✅ Delete Template
  const handleDelete = async (id) => {
    try {
      const response = await api.put(`/template/updateTemplate/${id}`, { isDeleted: 1 });
      if (response.data?.status) {
        setSnackbar({ open: true, message: '❌ Template deleted successfully!', severity: 'success' });
        await getAllTemplates();
      } else {
        setSnackbar({ open: true, message: response.data?.message || '❌ Failed to delete template.', severity: 'error' });
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setSnackbar({ open: true, message: '❌ Error deleting template.', severity: 'error' });
    }
  };

  // ✅ Save Template (Create or Update)
  const handleSave = async () => {
    if (!newTemplate.name || !newTemplate.subject) {
      setSnackbar({ open: true, message: 'Please enter both name and subject.', severity: 'warning' });
      return;
    }

    try {
      if (editMode && newTemplate.id) {
        const response = await api.put(`/template/updateTemplate/${newTemplate.id}`, {
          isDeleted: 0,
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
        });
        if (response.data?.status) {
          setSnackbar({ open: true, message: '✅ Template updated successfully!', severity: 'success' });
          await getAllTemplates();
        } else {
          setSnackbar({ open: true, message: response.data?.message || '❌ Failed to update template.', severity: 'error' });
        }
      } else {
        const response = await api.post('/template/createTemplate', {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
        });
        if (response.data?.status) {
          setSnackbar({ open: true, message: '✅ Template created successfully!', severity: 'success' });
          await getAllTemplates();
        } else {
          setSnackbar({ open: true, message: response.data?.message || '❌ Failed to create template.', severity: 'error' });
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({ open: true, message: '❌ Error while saving template.', severity: 'error' });
    }
  };

  // ✅ Edit Template
  const handleEdit = async (index) => {
    const selectedTemplate = templates[index];
    if (selectedTemplate?.id) {
      await getTemplateById(selectedTemplate.id);
    } else {
      setSnackbar({ open: true, message: 'Template ID not found.', severity: 'warning' });
    }
  };

  // ✅ Send Email with Unsubscribe Footer
  const handleSendEmail = async (template) => {
    try {
      const unsubscribeFooter = `
        <br /><hr />
        <p style="font-size: 13px; color: gray; text-align: center;"> 
          You are receiving this email as part of our professional communications.<br/>
          If you do not wish to receive further emails from us, please click below:<br/><br/>
          <a href="https://http://14.195.114.174:5018/api/email/unsubscribe?email={{email}}" 
          style="background-color:#d9534f;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
          Unsubscribe </a>
        </p>
      `;

      const emailContent = template.content.includes('Unsubscribe')
        ? template.content
        : `${template.content}${unsubscribeFooter}`;

      const res = await api.post('/email/sendBulkEmail', {
        subject: template.subject,
        content: emailContent,
      });

      if (res.data?.status) {
        setSnackbar({ open: true, message: '📧 Email sent successfully with unsubscribe footer!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: '❌ Failed to send email.', severity: 'error' });
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setSnackbar({ open: true, message: '❌ Error sending email.', severity: 'error' });
    }
  };

  // ✅ Handle Unsubscribe API Call
  const handleUnsubscribe = async (e, email) => {
    e.preventDefault(); // ✅ Stop page navigation

    try {
      const response = await fetch(`https://your-backend-api.com/api/unsubscribe?email=${email}`, {
        method: 'GET',
      });

      if (response.ok) {
        alert('You have been unsubscribed successfully.');
      } else {
        alert('Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Something went wrong. Please try again later.');
    }
  };


  return (
    <div>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom={2}>
        <h2>Template List</h2>
        <Button variant="contained" onClick={handleOpen}>
          New Template
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {templates.length > 0 ? (
              templates
                .slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)
                .map((template, index) => (
                  <TableRow key={template.id || index}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 250,
                          display: 'block',
                        }}
                        title={template.subject} // shows full text on hover
                      >
                        {template.subject}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 200,
                          display: 'block',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: template.content
                            ? template.content.replace(/(<([^>]+)>)/gi, '').replace(/\s+/g, ' ')
                            : '',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {template.isDeleted === 1 ? (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Deleted</span>
                      ) : (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {template.isDeleted !== 1 && (
                        <>
                          <IconButton onClick={() => handleSendEmail(template)} size="small" style={{ marginRight: 8 }}>
                            <SendIcon fontSize="small" />
                          </IconButton>

                          <IconButton onClick={() => handleEdit(page * itemsPerPage + index)} size="small" style={{ marginRight: 8 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton color="error" onClick={() => handleConfirmDelete(template?.id)} size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No templates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          rowsPerPage={itemsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setItemsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={templates.length}
        />
      </TableContainer>

      {/* Add / Edit Template Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Template' : 'New Template'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Template Name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
            <TextField
              label="Subject"
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
            />
            <div>
              <label>Content</label>
              <CKEditor
                editor={ClassicEditor}
                data={newTemplate.content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setNewTemplate({ ...newTemplate, content: data });
                }}
              />
            </div>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this template?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (selectedTemplateId) {
                await handleDelete(selectedTemplateId);
                setConfirmOpen(false);
              }
            }}
            color="error"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default TemplatePage;