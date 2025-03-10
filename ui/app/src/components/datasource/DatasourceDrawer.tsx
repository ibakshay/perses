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

import { Drawer, ErrorAlert, ErrorBoundary } from '@perses-dev/components';
import { Datasource, DatasourceDefinition } from '@perses-dev/core';
import {
  DatasourceEditorForm,
  PluginRegistry,
  ValidationProvider,
  remotePluginLoader,
} from '@perses-dev/plugin-system';
import { ReactElement, useState } from 'react';
import { DeleteResourceDialog } from '../dialogs';
import { DrawerProps } from '../form-drawers';

interface DatasourceDrawerProps<T extends Datasource> extends DrawerProps<T> {
  datasource: T;
}

export function DatasourceDrawer<T extends Datasource>({
  datasource,
  action,
  isOpen,
  isReadonly,
  onActionChange,
  onSave,
  onClose,
  onDelete,
}: DatasourceDrawerProps<T>): ReactElement {
  const [isDeleteDatasourceDialogStateOpened, setDeleteDatasourceDialogStateOpened] = useState<boolean>(false);

  // Disables closing on click out. This is a quick-win solution to avoid losing draft changes.
  // -> TODO find a way to enable closing by clicking-out in edit view, with a discard confirmation modal popping up
  const handleClickOut = (): void => {
    /* do nothing */
  };

  const handleSave = (def: DatasourceDefinition): void => {
    datasource.spec = def.spec;
    datasource.metadata.name = def.name;
    if (onSave) {
      onSave(datasource);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClickOut} data-testid="datasource-editor">
      <ErrorBoundary FallbackComponent={ErrorAlert}>
        <PluginRegistry pluginLoader={remotePluginLoader()}>
          <ValidationProvider>
            {isOpen && (
              <DatasourceEditorForm
                initialDatasourceDefinition={{ name: datasource.metadata.name, spec: datasource.spec }}
                action={action}
                isDraft={false}
                isReadonly={isReadonly}
                onActionChange={onActionChange}
                onSave={handleSave}
                onClose={onClose}
                onDelete={onDelete ? (): void => setDeleteDatasourceDialogStateOpened(true) : undefined}
              />
            )}
          </ValidationProvider>
        </PluginRegistry>
        {onDelete && (
          <DeleteResourceDialog
            open={isDeleteDatasourceDialogStateOpened}
            resource={datasource}
            onClose={() => setDeleteDatasourceDialogStateOpened(false)}
            onSubmit={(d) =>
              onDelete(d).then(() => {
                setDeleteDatasourceDialogStateOpened(false);
                onClose();
              })
            }
          />
        )}
      </ErrorBoundary>
    </Drawer>
  );
}
