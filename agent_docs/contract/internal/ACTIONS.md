# Internal wrapped actions

These actions may appear in traces but are not public direct actions or primitives.

## Internal materialization inventory

이 표는 runtime과 trace에 존재하지만 public type과 direct action 계약에서 제외되는 wrapped
action의 전체 목록이다. 각 action은 해당 state 또는 graphical consumer를 소유한 public
domain action을 통해서만 실행한다.

| Internal action | Owning domain |
| --- | --- |
| `materializeDensityData` | density data actions |
| `materializeFilteredData` | filter data actions |
| `materializeRegressionData` | regression data actions |
| `rematerializeAreaMark` | area mark and encoding actions |
| `rematerializeBarMark` | bar mark and encoding actions |
| `rematerializeGrid` | grid aggregate and Canvas actions |
| `rematerializeHorizontalGrid` | horizontal grid and Canvas actions |
| `rematerializeLegend` | legend, encoding, scale, and Canvas actions |
| `rematerializeLineMark` | line mark and encoding actions |
| `rematerializePointMark` | point mark and encoding actions |
| `rematerializeScale` | scale-owning encoding and Canvas actions |
| `rematerializeSizeLegend` | point size legend, scale, and Canvas actions |
| `rematerializeTitle` | title and Canvas actions |
| `rematerializeVerticalGrid` | vertical grid and Canvas actions |

## Internal guide component inventory

이 action들은 public `createLegend` facade가 호출하는 peer wrapped component다. 둘 다 public
type과 direct action 계약에서 제외되지만 hierarchy는 `trace`에 남는다.

| Internal action | Public owner | Role |
| --- | --- | --- |
| `createCategoricalLegend` | `createLegend` | categorical color/shape/stroke-dash block |
| `createSizeLegend` | `createLegend` | quantitative equal-area point-size block |

