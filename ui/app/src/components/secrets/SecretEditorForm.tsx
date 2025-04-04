// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Secret, secretsEditorSchema, SecretsEditorSchemaType } from '@perses-dev/core';
import React, { ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { getSubmitText, getTitleAction } from '@perses-dev/plugin-system';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  BoxProps,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DiscardChangesConfirmationDialog, FormActions } from '@perses-dev/components';
import TrashIcon from 'mdi-material-ui/TrashCan';
import PlusIcon from 'mdi-material-ui/Plus';
import { FormEditorProps } from '../form-drawers';

const noAuthIndex = 'noAuth';
const basicAuthIndex = 'basicAuth';
const authorizationIndex = 'authorization';

type SecretEditorFormProps = FormEditorProps<Secret>;

export function SecretEditorForm({
  initialValue,
  action,
  isDraft,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: SecretEditorFormProps): ReactElement {
  // Reset all attributes that are "hidden" by the API and are returning <secret> as value
  const initialSecretClean: Secret = useMemo(() => {
    const result = { ...initialValue };
    if (result.spec.basicAuth?.password) result.spec.basicAuth.password = '';
    if (result.spec.authorization?.credentials) result.spec.authorization.credentials = '';
    if (result.spec.tlsConfig?.ca) result.spec.tlsConfig.ca = '';
    if (result.spec.tlsConfig?.cert) result.spec.tlsConfig.cert = '';
    if (result.spec.tlsConfig?.key) result.spec.tlsConfig.key = '';
    return result;
  }, [initialValue]);

  const [isDiscardDialogOpened, setDiscardDialogOpened] = useState<boolean>(false);

  const titleAction = getTitleAction(action, isDraft);
  const submitText = getSubmitText(action, isDraft);

  const form = useForm<SecretsEditorSchemaType>({
    resolver: zodResolver(secretsEditorSchema),
    mode: 'onBlur',
    defaultValues: initialSecretClean,
  });

  const [isTLSConfigEnabled, setTLSConfigEnabled] = useState<boolean>(initialSecretClean.spec.tlsConfig !== undefined);

  const processForm: SubmitHandler<SecretsEditorSchemaType> = (data: Secret) => {
    onSave(data);
  };

  // When user click on cancel, several possibilities:
  // - create action: ask for discard approval
  // - update action: ask for discard approval if changed
  // - read action: don´t ask for discard approval
  function handleCancel(): void {
    if (JSON.stringify(initialSecretClean) !== JSON.stringify(form.getValues())) {
      setDiscardDialogOpened(true);
    } else {
      onClose();
    }
  }

  // Form errors are removed only from latest input touched
  // This will remove errors for others inputs
  useEffect(() => {
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isValid]);

  const [tabValue, setTabValue] = useState<string>(
    initialSecretClean.spec.basicAuth
      ? basicAuthIndex
      : initialSecretClean.spec.authorization
        ? authorizationIndex
        : noAuthIndex
  );

  const handleTabChange = (event: SyntheticEvent, newValue: string): void => {
    if (newValue === basicAuthIndex) {
      form.setValue('spec.basicAuth', { username: '', password: '', passwordFile: '' });
    } else if (newValue === authorizationIndex) {
      form.setValue('spec.authorization', { type: '', credentials: '', credentialsFile: '' });
    }
    form.trigger();

    setTabValue(newValue);

    if (newValue === noAuthIndex) {
      form.setValue('spec.authorization', undefined);
      form.setValue('spec.basicAuth', undefined);
    } else if (newValue === basicAuthIndex) {
      form.setValue('spec.authorization', undefined);
    } else if (newValue === authorizationIndex) {
      form.setValue('spec.basicAuth', undefined);
    }
    form.trigger();
  };

  return (
    <FormProvider {...form}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: (theme) => theme.spacing(1, 2),
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h2">{titleAction} Secret</Typography>
        <FormActions
          action={action}
          submitText={submitText}
          isReadonly={isReadonly}
          isValid={form.formState.isValid}
          onActionChange={onActionChange}
          onSubmit={form.handleSubmit(processForm)}
          onDelete={onDelete}
          onCancel={handleCancel}
        />
      </Box>
      <Stack padding={2} gap={2} sx={{ overflowY: 'scroll' }}>
        <Stack gap={2} direction="row">
          <Controller
            control={form.control}
            name="metadata.name"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Name"
                InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                InputProps={{
                  disabled: action === 'update',
                  readOnly: action === 'read',
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={(event) => {
                  field.onChange(event);
                }}
              />
            )}
          />
        </Stack>
        <Divider />

        <Box sx={{ width: '100%' }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <FormControl>
              <RadioGroup row value={tabValue} onChange={handleTabChange} aria-labelledby="Secret Authorization Setup">
                <FormControlLabel
                  disabled={isReadonly}
                  value={noAuthIndex}
                  control={<Radio />}
                  label="No Authorization"
                />
                <FormControlLabel
                  disabled={isReadonly}
                  value={basicAuthIndex}
                  control={<Radio />}
                  label="Basic Authorization"
                />
                <FormControlLabel
                  disabled={isReadonly}
                  value={authorizationIndex}
                  control={<Radio />}
                  label="Custom Authorization"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
          <TabPanel value={tabValue} index={basicAuthIndex}>
            <Stack gap={2}>
              <Controller
                name="spec.basicAuth.username"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Username"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <Stack direction="row">
                <Controller
                  control={form.control}
                  name="spec.basicAuth.password"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Divider orientation="vertical">OR</Divider>
                <Controller
                  control={form.control}
                  name="spec.basicAuth.passwordFile"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </TabPanel>
          <TabPanel value={tabValue} index={authorizationIndex}>
            <Stack gap={2}>
              <Controller
                control={form.control}
                name="spec.authorization.type"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Type"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <Stack direction="row">
                <Controller
                  control={form.control}
                  name="spec.authorization.credentials"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Credentials"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Divider orientation="vertical">OR</Divider>
                <Controller
                  control={form.control}
                  name="spec.authorization.credentialsFile"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Credentials File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </TabPanel>
        </Box>

        <Stack gap={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h1">TLS Config</Typography>
            {isTLSConfigEnabled && (
              <IconButton
                sx={{ width: 'fit-content', height: 'fit-content' }}
                onClick={() => {
                  setTLSConfigEnabled(false);
                  form.setValue('spec.tlsConfig', undefined);
                  form.trigger();
                }}
              >
                <TrashIcon />
              </IconButton>
            )}
          </Stack>
          {isTLSConfigEnabled ? (
            <Stack gap={2}>
              <Stack direction="row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.ca"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="CA"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Divider orientation="vertical">OR</Divider>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.caFile"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="CA File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </Stack>
              <Stack direction="row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.cert"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cert"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Divider orientation="vertical">OR</Divider>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.certFile"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cert File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </Stack>
              <Stack direction="row">
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.key"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Key"
                      type="password"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Divider orientation="vertical">OR</Divider>
                <Controller
                  control={form.control}
                  name="spec.tlsConfig.keyFile"
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Key File"
                      InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                      InputProps={{
                        readOnly: action === 'read',
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                      }}
                    />
                  )}
                />
              </Stack>
              <Controller
                control={form.control}
                name="spec.tlsConfig.serverName"
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Server Name"
                    InputLabelProps={{ shrink: action === 'read' ? true : undefined }}
                    InputProps={{
                      readOnly: action === 'read',
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onChange={(event) => {
                      field.onChange(event);
                    }}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="spec.tlsConfig.insecureSkipVerify"
                render={({ field }) => (
                  <FormControlLabel
                    label="Insecure Skip Verify"
                    control={
                      <Switch
                        {...field}
                        checked={!!field.value}
                        readOnly={action === 'read'}
                        onChange={(event) => {
                          if (action === 'read') return; // ReadOnly prop is not blocking user interaction...
                          field.onChange(event);
                        }}
                      />
                    }
                  />
                )}
              />
            </Stack>
          ) : (
            <IconButton
              sx={{ width: 'fit-content', height: 'fit-content' }}
              onClick={() => {
                form.setValue('spec.tlsConfig', {
                  ca: '',
                  caFile: '',
                  cert: '',
                  certFile: '',
                  key: '',
                  keyFile: '',
                  serverName: '',
                  insecureSkipVerify: false,
                });
                setTLSConfigEnabled(true);
              }}
            >
              <PlusIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <DiscardChangesConfirmationDialog
        description="Are you sure you want to discard these changes? Changes cannot be recovered."
        isOpen={isDiscardDialogOpened}
        onCancel={() => {
          setDiscardDialogOpened(false);
        }}
        onDiscardChanges={() => {
          setDiscardDialogOpened(false);
          onClose();
        }}
      />
    </FormProvider>
  );
}

interface TabPanelProps extends BoxProps {
  index: string;
  value: string;
}

function TabPanel({ children, value, index, ...props }: TabPanelProps): ReactElement {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`secret-form-tabpanel-${index}`}
      aria-labelledby={`secret-form-tab-${index}`}
      {...props}
    >
      {value === index && children}
    </Box>
  );
}
