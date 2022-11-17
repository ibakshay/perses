// Copyright 2022 The Perses Authors
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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatChartOptions } from './stat-chart-model';
import { StatChartOptionsEditorSettings } from './StatChartOptionsEditorSettings';

const MOCK_QUERY = {
  kind: 'TimeSeriesQuery',
  spec: {
    plugin: {
      kind: 'PrometheusTimeSeriesQuery',
      spec: {
        query: '',
      },
    },
  },
} as const;

describe('StatChartOptionsEditorSettings', () => {
  const renderStatChartOptionsEditorSettings = (value: StatChartOptions, onChange = jest.fn()) => {
    render(<StatChartOptionsEditorSettings value={value} onChange={onChange} />);
  };

  it('can modify unit', () => {
    const onChange = jest.fn();
    renderStatChartOptionsEditorSettings(
      {
        name: 'Stats',
        unit: {
          kind: 'Minutes',
        },
        calculation: 'Last',
        query: MOCK_QUERY,
      },
      onChange
    );
    const unitSelector = screen.getByRole('combobox', { name: 'Units' });
    userEvent.click(unitSelector);
    const percentOption = screen.getByRole('option', {
      name: 'Percent (0-100)',
    });
    userEvent.click(percentOption);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        unit: {
          kind: 'Percent',
        },
      })
    );
  });

  it('can modify calculation', () => {
    const onChange = jest.fn();
    renderStatChartOptionsEditorSettings(
      {
        name: 'My Stats',
        unit: {
          kind: 'Days',
        },
        calculation: 'Sum',
        query: MOCK_QUERY,
      },
      onChange
    );
    const calcSelector = screen.getByRole('combobox', { name: 'Calculation' });
    userEvent.click(calcSelector);
    const firstOption = screen.getByRole('option', {
      name: 'First',
    });
    userEvent.click(firstOption);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        calculation: 'First',
      })
    );
  });

  it('can enable a sparkline', () => {
    const onChange = jest.fn();
    renderStatChartOptionsEditorSettings(
      {
        name: 'enable spark stats',
        unit: {
          kind: 'Days',
        },
        calculation: 'Sum',
        query: MOCK_QUERY,
      },
      onChange
    );
    const sparklineSwitch = screen.getByRole('checkbox', { name: 'Sparkline' });
    expect(sparklineSwitch).not.toBeChecked();
    userEvent.click(sparklineSwitch);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sparkline: {},
      })
    );
  });

  it('can disable a sparkline', () => {
    const onChange = jest.fn();
    renderStatChartOptionsEditorSettings(
      {
        name: 'enable spark stats',
        unit: {
          kind: 'Days',
        },
        calculation: 'Sum',
        sparkline: {
          color: '#ff0000',
        },
        query: MOCK_QUERY,
      },
      onChange
    );
    const sparklineSwitch = screen.getByRole('checkbox', { name: 'Sparkline' });
    expect(sparklineSwitch).toBeChecked();
    userEvent.click(sparklineSwitch);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sparkline: undefined,
      })
    );
  });
});