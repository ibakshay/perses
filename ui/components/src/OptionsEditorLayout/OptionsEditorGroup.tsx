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

import { Box, Typography, Stack } from '@mui/material';
import React, { ReactElement } from 'react';

export type OptionsEditorGroupProps = {
  /**
   * Text that communicates the purpose of the grouping.
   */
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

/**
 * Group similar content within panel options.
 */
export const OptionsEditorGroup = ({ title, children, icon }: OptionsEditorGroupProps): ReactElement => {
  return (
    <Box>
      <Box display="flex" borderBottom={1} borderColor="grey.300" marginBottom={(theme) => theme.spacing(1)}>
        <Typography variant="overline" component="h4">
          {title}
        </Typography>
        {icon && <Box sx={{ marginLeft: 'auto' }}>{icon}</Box>}
      </Box>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
};
