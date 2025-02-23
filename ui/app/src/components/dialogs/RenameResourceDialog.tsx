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

import { Dispatch, DispatchWithoutAction, ReactElement } from 'react';
import { Button, TextField } from '@mui/material';
import { Dialog } from '@perses-dev/components';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { ProjectResource } from '@perses-dev/core';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

interface RenameResourceDialogProps {
  resource: ProjectResource;
  open: boolean;
  onSubmit: Dispatch<string>;
  onClose: DispatchWithoutAction;
}

/**
 * Dialog used to rename a resource.
 * @param props.open Define if the dialog should be opened or not.
 * @param props.onSubmit Action to perform when user confirmed.
 * @param props.onClose Provides the function to close itself.
 */
export function RenameResourceDialog(props: RenameResourceDialogProps): ReactElement {
  const { resource, open, onSubmit, onClose } = props;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  function processForm(data: z.infer<typeof schema>): void {
    onSubmit(data.name);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <Dialog.Header>
        Rename {resource.kind}: {resource.metadata.name}
      </Dialog.Header>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(processForm)}>
          <Dialog.Content sx={{ width: '100%' }}>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  required
                  margin="dense"
                  id="name"
                  label="Name"
                  type="text"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button variant="contained" type="submit" disabled={!form.formState.isValid}>
              Rename
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </Dialog.Actions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
