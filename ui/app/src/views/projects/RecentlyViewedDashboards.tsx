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

import { Box, Stack, Typography, Card } from '@mui/material';
import { ErrorAlert, ErrorBoundary } from '@perses-dev/components';
import HistoryIcon from 'mdi-material-ui/History';
import { ReactElement } from 'react';
import { useRecentDashboardList } from '../../model/dashboard-client';
import { RecentDashboardList } from '../../components/DashboardList/RecentDashboardList';
import { MENU_TABS_HEIGHT } from '../../components/tabs';

interface RecentlyViewedDashboardsProps {
  projectName: string;
  id?: string;
}

export function RecentlyViewedDashboards(props: RecentlyViewedDashboardsProps): ReactElement {
  const { data, isLoading } = useRecentDashboardList(props.projectName);

  return (
    <Box id={props.id}>
      <Stack
        alignItems="center"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack
          alignItems="center"
          sx={{
            width: '100%',
            height: MENU_TABS_HEIGHT,
            flexDirection: 'row',
          }}
        >
          <HistoryIcon />
          <Typography ml={1} variant="h3">
            Recently Viewed Dashboards
          </Typography>
        </Stack>
      </Stack>
      <ErrorBoundary FallbackComponent={ErrorAlert}>
        <Card sx={{ marginTop: 2 }}>
          <RecentDashboardList dashboardList={data} isLoading={isLoading} hideProject={true} />
        </Card>
      </ErrorBoundary>
    </Box>
  );
}
