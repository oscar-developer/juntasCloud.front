import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyPersonaConstancia } from '../services/personaConstancias.service';
import type { PersonaConstanciaVerification } from '../types';

type VerificationState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: PersonaConstanciaVerification; error: null }
  | { status: 'error'; data: null; error: string };

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export function PersonaConstanciaVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<VerificationState>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', data: null, error: 'El enlace de verificación está incompleto.' });
      return undefined;
    }

    const controller = new AbortController();
    setState({ status: 'loading', data: null, error: null });

    void verifyPersonaConstancia(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error.message : 'No se pudo verificar la constancia.',
          });
        }
      });

    return () => controller.abort();
  }, [token]);

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: { xs: 3, sm: 7 } }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <Box sx={{ bgcolor: 'success.dark', height: 8 }} />
          <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
            {state.status === 'loading' ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                <CircularProgress />
                <Typography color="text.secondary">Verificando constancia...</Typography>
              </Stack>
            ) : null}

            {state.status === 'error' ? (
              <Stack alignItems="center" spacing={2.5} sx={{ py: 4, textAlign: 'center' }}>
                <SearchOffRoundedIcon color="error" sx={{ fontSize: 52 }} />
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 900 }}>Constancia no encontrada</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No fue posible confirmar la autenticidad de este documento.
                  </Typography>
                </Box>
                <Alert severity="error" sx={{ width: '100%' }}>
                  {state.error}
                </Alert>
              </Stack>
            ) : null}

            {state.status === 'success' ? <VerificationResult data={state.data} /> : null}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function VerificationResult({ data }: { data: PersonaConstanciaVerification }) {
  const Icon = data.valida ? CheckCircleRoundedIcon : CancelRoundedIcon;

  return (
    <Stack spacing={3}>
      <Stack alignItems="center" spacing={1.25} sx={{ textAlign: 'center' }}>
        <Icon color={data.valida ? 'success' : 'error'} sx={{ fontSize: 56 }} />
        <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 900 }}>
          {data.valida ? 'Constancia válida' : 'Constancia revocada'}
        </Typography>
        <Chip
          color={data.valida ? 'success' : 'error'}
          label={data.estado}
          size="small"
          variant="outlined"
        />
      </Stack>

      {!data.valida && data.motivoRevocacion ? (
        <Alert severity="error">Motivo de revocación: {data.motivoRevocacion}</Alert>
      ) : null}

      <Divider />

      <Stack spacing={1.75}>
        <Detail label="Código" value={data.codigo} />
        <Detail label="Emitida por" value={data.tenant.nombre} />
        <Detail
          label="Documento del emisor"
          value={[data.tenant.tipoDocumento, data.tenant.numeroDocumento].filter(Boolean).join(' ') || 'No registrado'}
        />
        <Detail label="Fecha de emisión" value={formatDateTime(data.issuedAt)} />
      </Stack>

      <Box sx={{ bgcolor: 'grey.50', border: 1, borderColor: 'divider', p: 2 }}>
        <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
          PERSONA REGISTRADA
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 900, mt: 0.5 }}>
          {data.persona.nombreCompleto}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 3 }} sx={{ mt: 1 }}>
          <Typography variant="body2">DNI: {data.persona.dniEnmascarado ?? 'No registrado'}</Typography>
          <Typography variant="body2">Padrón: {data.persona.nroPadron ?? 'No registrado'}</Typography>
          <Typography variant="body2">Estado: {data.persona.estado}</Typography>
        </Stack>
      </Box>

      <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }} variant="caption">
        Huella del registro: {data.snapshotHash}
      </Typography>
    </Stack>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</Typography>
    </Box>
  );
}
