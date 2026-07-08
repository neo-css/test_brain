# ted-sbrain 测试大脑 后端接口文档

> 基础地址: `http://172.21.126.221:49152/ted-sbrain`
>
> 所有响应统一外层包装:

```json
{
  "result": true,          // boolean - 请求是否成功
  "message": "string",     // string  - 提示信息
  "data": {},              // object/array - 业务数据
  "criticalProcess": {}    // object - 关键流程信息（可忽略）
}
```

---

## 一、评分指标模块 (tags: 评分指标)

### 1.1 获取 Patch 详细评分

- **接口**: `GET /metric/patches/{patchId}/score`
- **描述**: 根据 Patch ID 获取该版本的详细评分信息
- **路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patchId | int64 | 是 | Patch ID |

- **响应 data 字段** (`PatchScoreVO`):

| 字段 | 类型 | 说明 |
|------|------|------|
| patchId | int64 | Patch ID |
| totalScore | number | 加权总分 |
| qualityScore | number | Patch 质量分 |
| behaviorScore | number | 测试行为分 |
| riskLevel | string | 风险等级，枚举: `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN` |
| snapshotsTs | datetime | 评分时间 |
| sysId | string | 系统简称 |
| systemName | string | 二级系统中文名 |
| systemKeyId | int32 | 系统编号 |
| systemLevel | string | 系统等级 |
| teamName | string | 所属团队 |
| patchOwner | string | 版本负责人 |
| patchOwnerId | string | 版本负责人用户ID |
| testLeader | string | 测试负责人 |
| testLeaderAccount | string | 测试负责人账号 |
| devLeader | string | 开发接口人 |
| devLeaderAccount | string | 开发接口人账号 |
| testOwner | string | 版本Owner |
| testOwnerUserId | string | 版本Owner用户ID |
| testOwnerGroup | string | 测试负责人所属组 |
| planedTestFromTime | datetime | 计划测试开始时间 |
| planedTestToTime | datetime | 计划测试结束时间 |
| planedIssueTime | datetime | 计划发版时间 |
| planedOnlineTime | datetime | 计划上线时间 |
| auditTime | datetime | 评审时间 |
| summary | string | 版本摘要 |
| description | string | 版本详细描述 |
| status | string | 版本状态 |
| releaseType | string | 发布类型 |
| metrics | MetricVO[] | 指标明细列表 |
| byPhase | GroupVO[] | 按阶段分组视图 |
| byDataDimension | GroupVO[] | 按数据维度分组视图 |
| byEvalTarget | GroupVO[] | 按评估对象分组视图 |

#### MetricVO（单个指标详情）

| 字段 | 类型 | 说明 |
|------|------|------|
| metricCode | string | 指标编码，枚举: `CHANGES_RISK` / `CASE_REVIEW_TIMELINESS` / `DEFECT_RISK` / `SMART_TEST` / `COVERAGE_390` / `COVERAGE_FUNCTION` |
| metricName | string | 指标名称 |
| phase | string | 所属阶段 |
| phaseName | string | 阶段名称 |
| dataDimension | string | 数据维度 |
| dataDimensionName | string | 数据维度名称 |
| evalTarget | string | 评估对象 |
| evalTargetName | string | 评估对象名称 |
| calcScore | number | 计算值 |
| actualScore | number | 实际值 |
| riskLevel | string | 指标风险等级，枚举: `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN` |
| features | object | 特征值（键值对，值为object） |
| description | string | 详细描述 |
| detailUrl | string | 详情页跳转链接 |

#### GroupVO（分组视图）

| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | 分组键 |
| displayName | string | 分组名称 |
| groupScore | number | 分组总分 |
| metrics | MetricVO[] | 指标列表 |

**响应示例**:

```json
{
  "result": true,
  "message": "success",
  "data": {
    "patchId": 12345,
    "totalScore": 85.5,
    "qualityScore": 90.0,
    "behaviorScore": 80.0,
    "riskLevel": "LOW",
    "snapshotsTs": "2026-07-08T10:30:00",
    "sysId": "SBrain",
    "systemName": "测试大脑系统",
    "systemKeyId": 1001,
    "systemLevel": "A",
    "teamName": "质量团队",
    "patchOwner": "张三",
    "patchOwnerId": "zhangsan",
    "testLeader": "李四",
    "testLeaderAccount": "lisi",
    "devLeader": "王五",
    "devLeaderAccount": "wangwu",
    "testOwner": "赵六",
    "testOwnerUserId": "zhaoliu",
    "testOwnerGroup": "测试一组",
    "planedTestFromTime": "2026-07-01T00:00:00",
    "planedTestToTime": "2026-07-15T00:00:00",
    "planedIssueTime": "2026-07-20T00:00:00",
    "planedOnlineTime": "2026-07-25T00:00:00",
    "auditTime": "2026-07-05T14:00:00",
    "summary": "V2.1版本",
    "description": "包含XX功能优化",
    "status": "TESTING",
    "releaseType": "NORMAL",
    "metrics": [
      {
        "metricCode": "CHANGES_RISK",
        "metricName": "变更风险",
        "phase": "DEV",
        "phaseName": "开发阶段",
        "dataDimension": "QUALITY",
        "dataDimensionName": "质量",
        "evalTarget": "PATCH",
        "evalTargetName": "版本",
        "calcScore": 12.5,
        "actualScore": 15.0,
        "riskLevel": "MEDIUM",
        "features": { "changeCount": { "value": 23 } },
        "description": "变更文件数23，风险中等",
        "detailUrl": "/detail/changes"
      }
    ],
    "byPhase": [
      {
        "key": "DEV",
        "displayName": "开发阶段",
        "groupScore": 45.0,
        "metrics": []
      }
    ],
    "byDataDimension": [],
    "byEvalTarget": []
  }
}
```

---

### 1.2 重新计算 Patch 评分

- **接口**: `POST /metric/patches/{patchId}/score/calculate`
- **描述**: 触发重新计算指定 Patch 的评分
- **路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patchId | int64 | 是 | Patch ID |

- **请求体**: 无
- **响应**: 与 `1.1` 相同，返回 `PatchScoreVO`

---

### 1.3 获取 Patch 评分历史趋势

- **接口**: `GET /metric/patches/{patchId}/score/history`
- **描述**: 获取指定 Patch 的评分历史变化趋势
- **路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| patchId | int64 | 是 | Patch ID |

- **响应 data 字段**: `PatchScoreVO[]`（数组，按时间排列的评分快照列表）

**响应示例**:

```json
{
  "result": true,
  "message": "success",
  "data": [
    {
      "patchId": 12345,
      "totalScore": 70.0,
      "qualityScore": 75.0,
      "behaviorScore": 65.0,
      "riskLevel": "MEDIUM",
      "snapshotsTs": "2026-07-06T10:00:00"
    },
    {
      "patchId": 12345,
      "totalScore": 85.5,
      "qualityScore": 90.0,
      "behaviorScore": 80.0,
      "riskLevel": "LOW",
      "snapshotsTs": "2026-07-08T10:30:00"
    }
  ]
}
```

---

## 二、评分快照模块 (tags: 评分快照)

### 2.1 主键查询

- **接口**: `GET /scoreSnapshot/get/{id}`
- **描述**: 根据快照 ID 获取单条评分快照
- **路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 快照 ID |

- **响应 data 字段**: `ScoreSnapshot`（见下方定义）

---

### 2.2 列表查询

- **接口**: `GET /scoreSnapshot/list`
- **描述**: 不分页，返回所有匹配的评分快照列表
- **查询参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| (同 ScoreSnapshot 字段) | - | 否 | 支持按 ScoreSnapshot 的字段作为查询条件 |

- **响应 data 字段**: `ScoreSnapshot[]`

---

### 2.3 分页查询

- **接口**: `GET /scoreSnapshot/page`
- **描述**: 分页查询评分快照
- **查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int32 | 否 | 1 | 当前页码 |
| pageSize | int32 | 否 | 10 | 每页条数 |
| (同 ScoreSnapshot 字段) | - | 否 | - | 支持按 ScoreSnapshot 的字段作为查询条件 |

- **响应 data 字段** (分页结构):

| 字段 | 类型 | 说明 |
|------|------|------|
| records | ScoreSnapshot[] | 数据列表 |
| total | int64 | 总记录数 |
| size | int64 | 每页条数 |
| current | int64 | 当前页码 |
| pages | int64 | 总页数 |

**响应示例**:

```json
{
  "result": true,
  "message": "success",
  "data": {
    "records": [
      {
        "id": "abc123",
        "patchId": 12345,
        "totalScore": 85.5,
        "qualityScore": 90.0,
        "behaviorScore": 80.0,
        "riskLevel": "LOW",
        "snapshotsTs": "2026-07-08T10:30:00",
        "sysId": "SBrain",
        "systemName": "测试大脑系统",
        "summary": "V2.1版本",
        "status": "TESTING",
        "releaseType": "NORMAL",
        "description": "包含XX功能优化",
        "systemKeyId": 1001,
        "systemLevel": "A",
        "teamName": "质量团队",
        "patchOwner": "张三",
        "patchOwnerId": "zhangsan",
        "testLeader": "李四",
        "testLeaderAccount": "lisi",
        "devLeader": "王五",
        "devLeaderAccount": "wangwu",
        "testOwner": "赵六",
        "testOwnerUserId": "zhaoliu",
        "testOwnerGroup": "测试一组",
        "planedTestFromTime": "2026-07-01T00:00:00",
        "planedTestToTime": "2026-07-15T00:00:00",
        "planedIssueTime": "2026-07-20T00:00:00",
        "planedOnlineTime": "2026-07-25T00:00:00",
        "auditTime": "2026-07-05T14:00:00",
        "createTs": "2026-07-08T10:30:00",
        "updateTs": "2026-07-08T10:30:00",
        "creator": "admin",
        "creatorId": "admin",
        "updater": "admin",
        "updaterId": "admin"
      }
    ],
    "total": 50,
    "size": 10,
    "current": 1,
    "pages": 5
  }
}
```

---

### 2.4 获取当天最新一批评分快照

- **接口**: `GET /scoreSnapshot/queryLatestToday`
- **描述**: 获取当天最新一批评分快照（默认 pageSize=200）
- **查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int32 | 否 | 1 | 当前页码 |
| pageSize | int32 | 否 | 200 | 每页条数（注意默认200） |
| (同 ScoreSnapshot 字段) | - | 否 | - | 支持按 ScoreSnapshot 的字段作为查询条件 |

- **响应**: 与 `2.3` 分页结构相同

---

## 三、系统模块 (tags: System)

### 3.1 健康检查

- **接口**: `GET /health`
- **描述**: 服务健康检查
- **参数**: 无
- **响应**: HTTP 200 即表示服务正常

---

## 四、数据模型

### ScoreSnapshot（评分快照）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 快照唯一标识 |
| patchId | int64 | Patch ID |
| totalScore | number | 加权总分 |
| qualityScore | number | 质量分 |
| behaviorScore | number | 测试行为分 |
| riskLevel | string | 风险等级: `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN` |
| snapshotsTs | datetime | 评分快照时间 |
| summary | string | 版本摘要 |
| status | string | 版本状态 |
| releaseType | string | 发布类型 |
| description | string | 版本描述 |
| sysId | string | 系统简称 |
| systemName | string | 二级系统中文名 |
| systemKeyId | int32 | 系统编号 |
| systemLevel | string | 系统等级 |
| teamName | string | 所属团队 |
| patchOwner | string | 版本负责人 |
| patchOwnerId | string | 版本负责人用户ID |
| testLeader | string | 测试负责人 |
| testLeaderAccount | string | 测试负责人账号 |
| devLeader | string | 开发接口人 |
| devLeaderAccount | string | 开发接口人账号 |
| testOwner | string | 版本Owner |
| testOwnerUserId | string | 版本Owner用户ID |
| testOwnerGroup | string | 测试负责人所属组 |
| planedTestFromTime | datetime | 计划测试开始时间 |
| planedTestToTime | datetime | 计划测试结束时间 |
| planedIssueTime | datetime | 计划发版时间 |
| planedOnlineTime | datetime | 计划上线时间 |
| auditTime | datetime | 评审时间 |
| createTs | datetime | 创建时间 |
| updateTs | datetime | 更新时间 |
| creator | string | 创建人 |
| creatorId | string | 创建人ID |
| updater | string | 更新人 |
| updaterId | string | 更新人ID |

### PatchScoreVO（Patch评分视图）

> 继承 ScoreSnapshot 的所有业务字段（无审计字段），额外增加:

| 字段 | 类型 | 说明 |
|------|------|------|
| metrics | MetricVO[] | 指标明细列表 |
| byPhase | GroupVO[] | 按阶段分组视图 |
| byDataDimension | GroupVO[] | 按数据维度分组视图 |
| byEvalTarget | GroupVO[] | 按评估对象分组视图 |

### MetricVO（指标详情）

| 字段 | 类型 | 说明 |
|------|------|------|
| metricCode | string | 指标编码 |
| metricName | string | 指标名称 |
| phase | string | 所属阶段 |
| phaseName | string | 阶段名称 |
| dataDimension | string | 数据维度 |
| dataDimensionName | string | 数据维度名称 |
| evalTarget | string | 评估对象 |
| evalTargetName | string | 评估对象名称 |
| calcScore | number | 计算值 |
| actualScore | number | 实际值 |
| riskLevel | string | 风险等级 |
| features | Map<String, Object> | 特征值 |
| description | string | 详细描述 |
| detailUrl | string | 详情页跳转链接 |

**metricCode 枚举值**:

| 值 | 含义 |
|----|------|
| CHANGES_RISK | 变更风险 |
| CASE_REVIEW_TIMELINESS | 用例评审及时性 |
| DEFECT_RISK | 缺陷风险 |
| SMART_TEST | 智能测试 |
| COVERAGE_390 | 390覆盖率 |
| COVERAGE_FUNCTION | 函数覆盖率 |

**riskLevel 枚举值**:

| 值 | 含义 |
|----|------|
| HIGH | 高风险 |
| MEDIUM | 中风险 |
| LOW | 低风险 |
| UNKNOWN | 未知 |

### GroupVO（分组视图）

| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | 分组键 |
| displayName | string | 分组名称 |
| groupScore | number | 分组总分 |
| metrics | MetricVO[] | 指标列表 |

---

## 五、接口汇总表

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 评分指标 | GET | /metric/patches/{patchId}/score | 获取Patch详细评分 |
| 评分指标 | POST | /metric/patches/{patchId}/score/calculate | 重新计算Patch评分 |
| 评分指标 | GET | /metric/patches/{patchId}/score/history | 获取Patch评分历史趋势 |
| 评分快照 | GET | /scoreSnapshot/get/{id} | 主键查询快照 |
| 评分快照 | GET | /scoreSnapshot/list | 列表查询快照 |
| 评分快照 | GET | /scoreSnapshot/page | 分页查询快照 |
| 评分快照 | GET | /scoreSnapshot/queryLatestToday | 获取当天最新快照 |
| 系统 | GET | /health | 健康检查 |
