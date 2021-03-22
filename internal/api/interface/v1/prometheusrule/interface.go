// Copyright 2021 Amadeus s.a.s
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

package prometheusrule

import (
	"github.com/perses/common/etcd"
	"github.com/perses/perses/internal/api/shared"
	v1 "github.com/perses/perses/pkg/model/api/v1"
)

type Query struct {
	etcd.Query
	// Name is a prefix of the PrometheusRule.metadata.name that is used to filter the list of the PrometheusRule.
	// Name can be empty in case you want to return the full list of PrometheusRule available.
	Name string `query:"name"`
	// Project is the exact name of the project.
	// The value can come or from the path of the URL or from the query parameter
	Project string `path:"project" query:"project"`
}

func (q *Query) Build() (string, error) {
	return v1.GeneratePrometheusRuleID(q.Project, q.Name), nil
}

type DAO interface {
	Create(entity *v1.PrometheusRule) error
	Update(entity *v1.PrometheusRule) error
	Delete(project string, name string) error
	Get(project string, name string) (*v1.PrometheusRule, error)
	List(q etcd.Query) ([]*v1.PrometheusRule, error)
}

type Service interface {
	shared.ToolboxService
}