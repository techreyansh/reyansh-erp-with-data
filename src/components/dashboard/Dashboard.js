import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Dashboard as DashboardIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { getAllClients } from "../../services/clientService";

/** Display placeholder for missing values */
function dash(value) {
  if (value == null || value === "") return "-";
  return String(value);
}

/**
 * Row shape from `getAllClients()` (camelCase) or raw Supabase / sheet row.
 */
function normalizeClientRow(row) {
  if (!row || typeof row !== "object") {
    return { id: "", clientname: null, city: null, state: null, gstin: null };
  }

  if (row.clientName != null || row.clientCode != null) {
    return {
      id: row.id ?? row.clientCode ?? "",
      clientname: row.clientName ?? row.ClientName,
      city: row.city ?? row.City,
      state: row.state ?? row.State,
      gstin: row.gstin ?? row.GSTIN,
    };
  }

  const rec =
    row.record && typeof row.record === "object" && !Array.isArray(row.record)
      ? row.record
      : {};
  const src = { ...rec, ...row };

  const pick = (...keys) => {
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i];
      const v = src[k];
      if (v != null && v !== "") return v;
    }
    return null;
  };

  return {
    id: row.id ?? pick("id") ?? "",
    clientname: pick("clientname", "ClientName", "clientName", "CLIENTNAME"),
    city: pick("city", "City"),
    state: pick("state", "State"),
    gstin: pick("gstin", "GSTIN", "Gstin"),
  };
}

/**
 * Executive dashboard — `getAllClients()` runs on every mount (each navigation to Dashboard).
 * Triggers Supabase `GET /rest/v1/clients2` via `db.getTableRows` inside `clientService`.
 */
const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    console.log("FETCH STARTED");

    setFetchLoading(true);
    setFetchError(null);

    getAllClients()
      .then((data) => {
        if (cancelled) return;
        console.log("FETCH SUCCESS");
        console.log("Dashboard clients payload:", data);
        setClients(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("FETCH ERROR:", err);
        setFetchError(err instanceof Error ? err : new Error(String(err)));
        setClients([]);
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = clients.map(normalizeClientRow);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {authLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Checking access…
        </Alert>
      )}

      {!authLoading && !user && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Not signed in — clients still load for debugging; RLS may return an empty list.
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <DashboardIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Executive Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clients overview — getAllClients on each Dashboard load (see Network → /rest/v1/clients2)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Could not load clients: {fetchError.message || String(fetchError)}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Clients
          </Typography>
        </Box>

        {fetchLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              py: 6,
              px: 2,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body1" color="text.secondary">
              Loading…
            </Typography>
          </Box>
        ) : !fetchError && rows.length === 0 ? (
          <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No clients found
            </Typography>
          </Box>
        ) : !fetchError ? (
          <TableContainer sx={{ maxHeight: 480 }}>
            <Table size="small" stickyHeader aria-label="Clients table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Client name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>GSTIN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((client, index) => (
                  <TableRow
                    key={
                      client.id
                        ? String(client.id)
                        : `client-row-${index}`
                    }
                    hover
                  >
                    <TableCell>{dash(client.clientname)}</TableCell>
                    <TableCell>{dash(client.city)}</TableCell>
                    <TableCell>{dash(client.state)}</TableCell>
                    <TableCell>{dash(client.gstin)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mt: 3, textAlign: "center" }}
      >
        Additional analytics and KPIs coming soon.
      </Typography>
    </Container>
  );
};

export default Dashboard;
