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

import { DashboardResource, getResourceDisplayName, getResourceExtendedDisplayName } from '@perses-dev/core';
import { Box, Stack, Tooltip } from '@mui/material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import DeleteIcon from 'mdi-material-ui/DeleteOutline';
import PencilIcon from 'mdi-material-ui/Pencil';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { intlFormatDistance } from 'date-fns';
import { useSnackbar } from '@perses-dev/components';
import { DeleteResourceDialog, RenameDashboardDialog } from '../dialogs';
import { DatedDashboards, useDeleteDashboardMutation } from '../../model/dashboard-client';
import { CRUDGridActionsCellItem } from '../CRUDButton/CRUDGridActionsCellItem';
import { DashboardDataGrid, Row } from './DashboardDataGrid';

export interface RecentDashboardListProperties {
  dashboardList: DatedDashboards[];
  hideProject?: boolean;
  hideToolbar?: boolean;
  isLoading?: boolean;
}

export function RecentDashboardList(props: RecentDashboardListProperties): ReactElement {
  const { dashboardList, hideProject, hideToolbar, isLoading } = props;
  const { successSnackbar, exceptionSnackbar } = useSnackbar();
  const deleteDashboardMutation = useDeleteDashboardMutation();

  const getDashboard = useCallback(
    (project: string, name: string) => {
      return dashboardList.find(
        (datedDashboard) =>
          datedDashboard.dashboard.metadata.project === project && datedDashboard.dashboard.metadata.name === name
      )?.dashboard;
    },
    [dashboardList]
  );

  const rows = useMemo(() => {
    return dashboardList.map<Row>((datedDashboard, index) => ({
      index,
      project: datedDashboard.dashboard.metadata.project,
      name: datedDashboard.dashboard.metadata.name,
      displayName: getResourceDisplayName(datedDashboard.dashboard),
      version: datedDashboard.dashboard.metadata.version ?? 0,
      createdAt: datedDashboard.dashboard.metadata.createdAt ?? '',
      updatedAt: datedDashboard.dashboard.metadata.updatedAt ?? '',
      viewedAt: datedDashboard.date,
    }));
  }, [dashboardList]);

  const [targetedDashboard, setTargetedDashboard] = useState<DashboardResource>();
  const [isRenameDashboardDialogStateOpened, setRenameDashboardDialogStateOpened] = useState<boolean>(false);
  const [isDeleteDashboardDialogStateOpened, setDeleteDashboardDialogStateOpened] = useState<boolean>(false);

  const onRenameButtonClick = useCallback(
    (project: string, name: string) => (): void => {
      setTargetedDashboard(getDashboard(project, name));
      setRenameDashboardDialogStateOpened(true);
    },
    [getDashboard]
  );

  const handleDashboardDelete = useCallback(
    (dashboard: DashboardResource): Promise<void> =>
      new Promise((resolve, reject) => {
        deleteDashboardMutation.mutate(dashboard, {
          onSuccess: (deletedDashboard: DashboardResource) => {
            successSnackbar(`Dashboard ${getResourceExtendedDisplayName(deletedDashboard)} was successfully deleted`);
            resolve();
          },
          onError: (err) => {
            exceptionSnackbar(err);
            reject();
            throw err;
          },
        });
      }),
    [exceptionSnackbar, successSnackbar, deleteDashboardMutation]
  );

  const onDeleteButtonClick = useCallback(
    (project: string, name: string) => (): void => {
      setTargetedDashboard(getDashboard(project, name));
      setDeleteDashboardDialogStateOpened(true);
    },
    [getDashboard]
  );

  const columns = useMemo<Array<GridColDef<Row>>>(
    () => [
      { field: 'project', headerName: 'Project', type: 'string', flex: 2, minWidth: 150 },
      { field: 'displayName', headerName: 'Display Name', type: 'string', flex: 3, minWidth: 150 },
      {
        field: 'version',
        headerName: 'Version',
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        flex: 1,
        minWidth: 80,
      },
      {
        field: 'createdAt',
        headerName: 'Creation Date',
        type: 'dateTime',
        flex: 1,
        minWidth: 125,
        valueGetter: (_, row): Date => new Date(row.createdAt),
        renderCell: (params): ReactElement => (
          <Tooltip title={params.value.toUTCString()} placement="top">
            <span>{intlFormatDistance(params.value, new Date())}</span>
          </Tooltip>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Last Update',
        type: 'dateTime',
        flex: 1,
        minWidth: 125,
        valueGetter: (_, row): Date => new Date(row.updatedAt),
        renderCell: (params): ReactElement => (
          <Tooltip title={params.value.toUTCString()} placement="top">
            <span>{intlFormatDistance(params.value, new Date())}</span>
          </Tooltip>
        ),
      },
      {
        field: 'viewedAt',
        headerName: 'Last Seen',
        type: 'dateTime',
        flex: 1,
        minWidth: 150,
        valueGetter: (_, row): Date | undefined => (row.viewedAt ? new Date(row.viewedAt) : undefined),
        renderCell: (params): ReactElement => (
          <Tooltip title={params.value.toUTCString()} placement="top">
            <span>{intlFormatDistance(params.value, new Date())}</span>
          </Tooltip>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        flex: 0.5,
        minWidth: 100,
        getActions: (params: GridRowParams<Row>): ReactElement[] => [
          <CRUDGridActionsCellItem
            key={params.id + '-edit'}
            icon={<PencilIcon />}
            label="Rename"
            action="update"
            scope="Dashboard"
            project={params.row.project}
            onClick={onRenameButtonClick(params.row.project, params.row.name)}
          />,
          <CRUDGridActionsCellItem
            key={params.id + '-delete'}
            icon={<DeleteIcon />}
            label="Delete"
            action="delete"
            scope="Dashboard"
            project={params.row.project}
            onClick={onDeleteButtonClick(params.row.project, params.row.name)}
          />,
        ],
      },
    ],
    [onRenameButtonClick, onDeleteButtonClick]
  );

  return (
    <Stack width="100%">
      <DashboardDataGrid
        rows={rows}
        columns={columns}
        initialState={{
          columns: {
            columnVisibilityModel: {
              project: !hideProject,
              id: false,
              version: false,
              createdAt: false,
              updatedAt: false,
              actions: false,
            },
          },
          sorting: {
            sortModel: [{ field: 'viewedAt', sort: 'desc' }],
          },
        }}
        hideToolbar={hideToolbar}
        isLoading={isLoading}
      />
      {targetedDashboard && (
        <Box>
          <RenameDashboardDialog
            open={isRenameDashboardDialogStateOpened}
            onClose={() => setRenameDashboardDialogStateOpened(false)}
            dashboard={targetedDashboard}
          />
          <DeleteResourceDialog
            open={isDeleteDashboardDialogStateOpened}
            resource={targetedDashboard}
            onSubmit={() => handleDashboardDelete(targetedDashboard)}
            onClose={() => setDeleteDashboardDialogStateOpened(false)}
          />
        </Box>
      )}
    </Stack>
  );
}
