import React, { useState, useEffect } from 'react';
import api from '../api';
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
  Snackbar,
  Alert,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Default footer for all emails
const defaultFooter = `
<br/><br/>
<hr/>
<p style="font-size: 12px; color: gray;">
You are receiving this email as part of our professional communications. 
If you do not wish to receive further emails from us, please 
<a href="{{unsubscribe_link}}">unsubscribe here</a>. 
Your preferences will be promptly updated, and we respect your privacy.
</p>
`;

const EmailPage = () => {
  const [emails, setEmails] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newEmail, setNewEmail] = useState({ name: '', email: '', body: '' });
  const [errors, setErrors] = useState({ name: '', email: '' });
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('');

  // ✅ New states for delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteIndex, setSelectedDeleteIndex] = useState(null);

  // ✅ Snackbar handler
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpen = () => {
    setNewEmail({ name: '', email: '', body: '' });
    setErrors({ name: '', email: '' });
    setEditingIndex(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewEmail({ name: '', email: '', body: '' });
    setErrors({ name: '', email: '' });
    setEditingIndex(null);
  };

  // ✅ Fetch Emails
  const getAllEmails = async () => {
    try {
      const res = await api.post('/email/getAllEmail', {
        page: page + 1,
        itemsPerPage,
        status: filterStatus === '' ? undefined : Number(filterStatus)
      });
      if (res?.data?.status) {
        let filteredEmails = res?.data?.data || [];
        if (filterStatus !== '') {
          filteredEmails = filteredEmails.filter(email => email.status === Number(filterStatus));
        }
        setEmails(filteredEmails);
        setTotalCount(filteredEmails.length);
      }
    } catch (err) {
      showSnackbar("❌ Error fetching emails", "error");
    }
  };

  useEffect(() => {
    getAllEmails();
  }, [page, itemsPerPage, filterStatus]);

  // ✅ Add or Edit Email with Footer
  const handleSaveEmail = async () => {
    let valid = true;
    let newErrors = { name: '', email: '' };

    if (!newEmail.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    if (!newEmail.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!newEmail.email.includes('@')) {
      newErrors.email = 'Email must contain "@"';
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    const emailContent = (newEmail.body || '') + defaultFooter.replace(
      '{{unsubscribe_link}}',
      `https://yourfrontend.com/unsubscribe/${editingIndex !== null ? emails[editingIndex].id : '0'}`
    );

    try {
      if (editingIndex !== null) {
        // ✅ Update email
        const emailId = emails[editingIndex].id;
        const res = await api.put(`/email/updateEmail/${emailId}`, {
          name: newEmail.name,
          email: newEmail.email,
          status: 0,
          content: emailContent
        });

        if (res.data?.status) {
          showSnackbar("✅ Email updated successfully", "success");
          await getAllEmails();
        } else {
          showSnackbar(res.data?.message || "❌ Failed to update email", "error");
        }
      } else {
        // ✅ Create new email
        const res = await api.post('/email/createEmail', {
          name: newEmail.name,
          email: newEmail.email,
          content: emailContent
        });

        if (res.data?.status) {
          showSnackbar("✅ Email created successfully", "success");
          await getAllEmails();
        } else if (res.data?.message === "Email already exists, but new record saved") {
          showSnackbar("❌ Email already exists, but new record saved", "error");
        } else {
          showSnackbar(res.data?.message || "Unexpected response", "warning");
        }
      }

      handleClose();
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Failed to save email", "error");
    }
  };

  // ✅ Delete Email
  const handleDelete = async (index) => {
    const emailId = emails[index].id;
    try {
      const res = await api.put(`/email/updateEmail/${emailId}`, { status: 0 });
      if (res.data?.status) {
        showSnackbar("✅ Email deleted successfully", "success");
        await getAllEmails();
      } else {
        showSnackbar(res.data?.message || "❌ Failed to delete email", "error");
      }
    } catch (err) {
      showSnackbar("❌ Error deleting email", "error");
    }
  };

  // ✅ Edit Email
  const handleEdit = async (index) => {
    try {
      const emailId = emails[index].id;
      const res = await api.get(`/email/get/${emailId}`);
      if (res.data?.status) {
        const data = res.data.data;
        setNewEmail({ name: data.name, email: data.email, body: data.content || '' });
        setEditingIndex(index);
        setOpen(true);
      } else {
        showSnackbar(res.data?.message || "❌ Failed to fetch email", "error");
      }
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Error fetching email", "error");
    }
  };

  // ✅ Upload Excel File
  const handleUploadExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('uploadFile', file);

    try {
      const res = await api.post('/email/uploadExcel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data) {
        showSnackbar('✅ File uploaded successfully', 'success');
        await getAllEmails();
      } else {
        showSnackbar('❌ Failed to upload file', 'error');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('❌ Error uploading file', 'error');
    }
  };

  return (
    <div>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" mb={2}>
        <FormControl sx={{ minWidth: 140 }} size="small">
          <InputLabel id="filter-status-label">Filter</InputLabel>
          <Select
            labelId="filter-status-label"
            id="filter-status"
            value={filterStatus}
            label="Filter"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Deleted</MenuItem>
            <MenuItem value={2}>Unsubscribe</MenuItem>
          </Select>
        </FormControl>

        {/* ✅ Excel Upload */}
        <Button variant="outlined" component="label">
          Upload File
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} />
        </Button>

        <Button variant="contained" onClick={handleOpen}>
          Add Email
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  {row.status === 0 && <span style={{ color: 'red', fontWeight: 'bold' }}>Deleted</span>}
                  {row.status === 1 && <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span>}
                  {row.status === 2 && <span style={{ color: 'orange', fontWeight: 'bold' }}>Unsubscribed</span>}
                </TableCell>
                <TableCell>
                  {row.status !== 0 && (
                    <>
                      <IconButton color="primary" size="small" onClick={() => handleEdit(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedDeleteIndex(index);
                          setConfirmOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        page={page}
        rowsPerPage={itemsPerPage}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setItemsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalCount}
      />

      {/* Add/Edit Email Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? "Edit Email" : "Add New Email"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={newEmail.name}
              onChange={(e) => setNewEmail({ ...newEmail, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              value={newEmail.email}
              onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEmail}>
            {editingIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this Email Template?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await handleDelete(selectedDeleteIndex);
              setConfirmOpen(false);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmailPage;