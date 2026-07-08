# ted-sbrain


**简介**:ted-sbrain


**HOST**:http://172.21.126.221:49152/ted-sbrain


**联系人**:


**Version**:v1.0.0


**接口路径**:/ted-sbrain/v3/api-docs


[TOC]






# 评分指标


## 重新计算Patch评分


**接口地址**:`/ted-sbrain/metric/patches/{patchId}/score/calculate`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|patchId|Patch ID|path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponsePatchScoreVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||PatchScoreVO|PatchScoreVO|
|&emsp;&emsp;patchId|Patch ID|integer(int64)||
|&emsp;&emsp;totalScore|加权总分|number||
|&emsp;&emsp;qualityScore|Patch 质量分|number||
|&emsp;&emsp;behaviorScore|测试行为分|number||
|&emsp;&emsp;riskLevel|风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;snapshotsTs|评分时间|string(date-time)||
|&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byPhase|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byDataDimension|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byEvalTarget|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;sysId|系统简称|string||
|&emsp;&emsp;systemName|二级系统中文名|string||
|&emsp;&emsp;systemKeyId|系统编号|integer(int32)||
|&emsp;&emsp;systemLevel|系统等级|string||
|&emsp;&emsp;teamName|所属团队|string||
|&emsp;&emsp;patchOwner|版本负责人|string||
|&emsp;&emsp;patchOwnerId|版本负责人用户ID|string||
|&emsp;&emsp;testLeader|测试负责人|string||
|&emsp;&emsp;testLeaderAccount|测试负责人账号|string||
|&emsp;&emsp;devLeader|开发接口人|string||
|&emsp;&emsp;devLeaderAccount|开发接口人账号|string||
|&emsp;&emsp;testOwner|版本Owner|string||
|&emsp;&emsp;testOwnerUserId|版本Owner用户ID|string||
|&emsp;&emsp;testOwnerGroup|测试负责人所属组|string||
|&emsp;&emsp;planedTestFromTime|计划测试开始时间|string(date-time)||
|&emsp;&emsp;planedTestToTime|计划测试结束时间|string(date-time)||
|&emsp;&emsp;planedIssueTime|计划发版时间|string(date-time)||
|&emsp;&emsp;planedOnlineTime|计划上线时间|string(date-time)||
|&emsp;&emsp;auditTime|评审时间|string(date-time)||
|&emsp;&emsp;summary|版本摘要|string||
|&emsp;&emsp;description|版本详细描述|string||
|&emsp;&emsp;status|版本状态|string||
|&emsp;&emsp;releaseType|发布类型|string||
|result||boolean||
|message||string||
|criticalProcess||ResponsePatchScoreVO_criticalProcess|ResponsePatchScoreVO_criticalProcess|


**响应示例**:
```javascript
{
	"data": {
		"patchId": 0,
		"totalScore": 0,
		"qualityScore": 0,
		"behaviorScore": 0,
		"riskLevel": "",
		"snapshotsTs": "",
		"metrics": [
			{
				"metricCode": "",
				"metricName": "",
				"phase": "",
				"phaseName": "",
				"dataDimension": "",
				"dataDimensionName": "",
				"evalTarget": "",
				"evalTargetName": "",
				"calcScore": 0,
				"actualScore": 0,
				"riskLevel": "",
				"features": {},
				"description": "",
				"detailUrl": ""
			}
		],
		"byPhase": [
			{
				"key": "",
				"displayName": "",
				"groupScore": 0,
				"metrics": [
					{
						"metricCode": "",
						"metricName": "",
						"phase": "",
						"phaseName": "",
						"dataDimension": "",
						"dataDimensionName": "",
						"evalTarget": "",
						"evalTargetName": "",
						"calcScore": 0,
						"actualScore": 0,
						"riskLevel": "",
						"features": {},
						"description": "",
						"detailUrl": ""
					}
				]
			}
		],
		"byDataDimension": [
			{}
		],
		"byEvalTarget": [
			{}
		],
		"sysId": "",
		"systemName": "",
		"systemKeyId": 0,
		"systemLevel": "",
		"teamName": "",
		"patchOwner": "",
		"patchOwnerId": "",
		"testLeader": "",
		"testLeaderAccount": "",
		"devLeader": "",
		"devLeaderAccount": "",
		"testOwner": "",
		"testOwnerUserId": "",
		"testOwnerGroup": "",
		"planedTestFromTime": "",
		"planedTestToTime": "",
		"planedIssueTime": "",
		"planedOnlineTime": "",
		"auditTime": "",
		"summary": "",
		"description": "",
		"status": "",
		"releaseType": ""
	},
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


## 获取Patch详细评分


**接口地址**:`/ted-sbrain/metric/patches/{patchId}/score`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|patchId|Patch ID|path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponsePatchScoreVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||PatchScoreVO|PatchScoreVO|
|&emsp;&emsp;patchId|Patch ID|integer(int64)||
|&emsp;&emsp;totalScore|加权总分|number||
|&emsp;&emsp;qualityScore|Patch 质量分|number||
|&emsp;&emsp;behaviorScore|测试行为分|number||
|&emsp;&emsp;riskLevel|风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;snapshotsTs|评分时间|string(date-time)||
|&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byPhase|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byDataDimension|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byEvalTarget|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;sysId|系统简称|string||
|&emsp;&emsp;systemName|二级系统中文名|string||
|&emsp;&emsp;systemKeyId|系统编号|integer(int32)||
|&emsp;&emsp;systemLevel|系统等级|string||
|&emsp;&emsp;teamName|所属团队|string||
|&emsp;&emsp;patchOwner|版本负责人|string||
|&emsp;&emsp;patchOwnerId|版本负责人用户ID|string||
|&emsp;&emsp;testLeader|测试负责人|string||
|&emsp;&emsp;testLeaderAccount|测试负责人账号|string||
|&emsp;&emsp;devLeader|开发接口人|string||
|&emsp;&emsp;devLeaderAccount|开发接口人账号|string||
|&emsp;&emsp;testOwner|版本Owner|string||
|&emsp;&emsp;testOwnerUserId|版本Owner用户ID|string||
|&emsp;&emsp;testOwnerGroup|测试负责人所属组|string||
|&emsp;&emsp;planedTestFromTime|计划测试开始时间|string(date-time)||
|&emsp;&emsp;planedTestToTime|计划测试结束时间|string(date-time)||
|&emsp;&emsp;planedIssueTime|计划发版时间|string(date-time)||
|&emsp;&emsp;planedOnlineTime|计划上线时间|string(date-time)||
|&emsp;&emsp;auditTime|评审时间|string(date-time)||
|&emsp;&emsp;summary|版本摘要|string||
|&emsp;&emsp;description|版本详细描述|string||
|&emsp;&emsp;status|版本状态|string||
|&emsp;&emsp;releaseType|发布类型|string||
|result||boolean||
|message||string||
|criticalProcess||ResponsePatchScoreVO_criticalProcess|ResponsePatchScoreVO_criticalProcess|


**响应示例**:
```javascript
{
	"data": {
		"patchId": 0,
		"totalScore": 0,
		"qualityScore": 0,
		"behaviorScore": 0,
		"riskLevel": "",
		"snapshotsTs": "",
		"metrics": [
			{
				"metricCode": "",
				"metricName": "",
				"phase": "",
				"phaseName": "",
				"dataDimension": "",
				"dataDimensionName": "",
				"evalTarget": "",
				"evalTargetName": "",
				"calcScore": 0,
				"actualScore": 0,
				"riskLevel": "",
				"features": {},
				"description": "",
				"detailUrl": ""
			}
		],
		"byPhase": [
			{
				"key": "",
				"displayName": "",
				"groupScore": 0,
				"metrics": [
					{
						"metricCode": "",
						"metricName": "",
						"phase": "",
						"phaseName": "",
						"dataDimension": "",
						"dataDimensionName": "",
						"evalTarget": "",
						"evalTargetName": "",
						"calcScore": 0,
						"actualScore": 0,
						"riskLevel": "",
						"features": {},
						"description": "",
						"detailUrl": ""
					}
				]
			}
		],
		"byDataDimension": [
			{}
		],
		"byEvalTarget": [
			{}
		],
		"sysId": "",
		"systemName": "",
		"systemKeyId": 0,
		"systemLevel": "",
		"teamName": "",
		"patchOwner": "",
		"patchOwnerId": "",
		"testLeader": "",
		"testLeaderAccount": "",
		"devLeader": "",
		"devLeaderAccount": "",
		"testOwner": "",
		"testOwnerUserId": "",
		"testOwnerGroup": "",
		"planedTestFromTime": "",
		"planedTestToTime": "",
		"planedIssueTime": "",
		"planedOnlineTime": "",
		"auditTime": "",
		"summary": "",
		"description": "",
		"status": "",
		"releaseType": ""
	},
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


## 获取Patch评分历史趋势


**接口地址**:`/ted-sbrain/metric/patches/{patchId}/score/history`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|patchId|Patch ID|path|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponseListPatchScoreVO|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||array|PatchScoreVO|
|&emsp;&emsp;patchId|Patch ID|integer(int64)||
|&emsp;&emsp;totalScore|加权总分|number||
|&emsp;&emsp;qualityScore|Patch 质量分|number||
|&emsp;&emsp;behaviorScore|测试行为分|number||
|&emsp;&emsp;riskLevel|风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;snapshotsTs|评分时间|string(date-time)||
|&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byPhase|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byDataDimension|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;byEvalTarget|分组视图|array|GroupVO|
|&emsp;&emsp;&emsp;&emsp;key|分组键|string||
|&emsp;&emsp;&emsp;&emsp;displayName|分组名称|string||
|&emsp;&emsp;&emsp;&emsp;groupScore|分组总分|number||
|&emsp;&emsp;&emsp;&emsp;metrics|单个指标详情|array|MetricVO|
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricCode|指标编码,可用值:CHANGES_RISK,CASE_REVIEW_TIMELINESS,DEFECT_RISK,SMART_TEST,COVERAGE_390,COVERAGE_FUNCTION|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;metricName|指标名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phase|所属阶段|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;phaseName|阶段名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimension|数据维度|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;dataDimensionName|数据维度名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTarget|评估对象|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;evalTargetName|评估对象名称|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;calcScore|计算值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;actualScore|实际值|number||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;riskLevel|指标风险等级,可用值:HIGH,MEDIUM,LOW,UNKNOWN|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;features|特征值|object||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;description|详细描述|string||
|&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;detailUrl|详情页跳转链接|string||
|&emsp;&emsp;sysId|系统简称|string||
|&emsp;&emsp;systemName|二级系统中文名|string||
|&emsp;&emsp;systemKeyId|系统编号|integer(int32)||
|&emsp;&emsp;systemLevel|系统等级|string||
|&emsp;&emsp;teamName|所属团队|string||
|&emsp;&emsp;patchOwner|版本负责人|string||
|&emsp;&emsp;patchOwnerId|版本负责人用户ID|string||
|&emsp;&emsp;testLeader|测试负责人|string||
|&emsp;&emsp;testLeaderAccount|测试负责人账号|string||
|&emsp;&emsp;devLeader|开发接口人|string||
|&emsp;&emsp;devLeaderAccount|开发接口人账号|string||
|&emsp;&emsp;testOwner|版本Owner|string||
|&emsp;&emsp;testOwnerUserId|版本Owner用户ID|string||
|&emsp;&emsp;testOwnerGroup|测试负责人所属组|string||
|&emsp;&emsp;planedTestFromTime|计划测试开始时间|string(date-time)||
|&emsp;&emsp;planedTestToTime|计划测试结束时间|string(date-time)||
|&emsp;&emsp;planedIssueTime|计划发版时间|string(date-time)||
|&emsp;&emsp;planedOnlineTime|计划上线时间|string(date-time)||
|&emsp;&emsp;auditTime|评审时间|string(date-time)||
|&emsp;&emsp;summary|版本摘要|string||
|&emsp;&emsp;description|版本详细描述|string||
|&emsp;&emsp;status|版本状态|string||
|&emsp;&emsp;releaseType|发布类型|string||
|result||boolean||
|message||string||
|criticalProcess||ResponseListPatchScoreVO_criticalProcess|ResponseListPatchScoreVO_criticalProcess|


**响应示例**:
```javascript
{
	"data": [
		{
			"patchId": 0,
			"totalScore": 0,
			"qualityScore": 0,
			"behaviorScore": 0,
			"riskLevel": "",
			"snapshotsTs": "",
			"metrics": [
				{
					"metricCode": "",
					"metricName": "",
					"phase": "",
					"phaseName": "",
					"dataDimension": "",
					"dataDimensionName": "",
					"evalTarget": "",
					"evalTargetName": "",
					"calcScore": 0,
					"actualScore": 0,
					"riskLevel": "",
					"features": {},
					"description": "",
					"detailUrl": ""
				}
			],
			"byPhase": [
				{
					"key": "",
					"displayName": "",
					"groupScore": 0,
					"metrics": [
						{
							"metricCode": "",
							"metricName": "",
							"phase": "",
							"phaseName": "",
							"dataDimension": "",
							"dataDimensionName": "",
							"evalTarget": "",
							"evalTargetName": "",
							"calcScore": 0,
							"actualScore": 0,
							"riskLevel": "",
							"features": {},
							"description": "",
							"detailUrl": ""
						}
					]
				}
			],
			"byDataDimension": [
				{}
			],
			"byEvalTarget": [
				{}
			],
			"sysId": "",
			"systemName": "",
			"systemKeyId": 0,
			"systemLevel": "",
			"teamName": "",
			"patchOwner": "",
			"patchOwnerId": "",
			"testLeader": "",
			"testLeaderAccount": "",
			"devLeader": "",
			"devLeaderAccount": "",
			"testOwner": "",
			"testOwnerUserId": "",
			"testOwnerGroup": "",
			"planedTestFromTime": "",
			"planedTestToTime": "",
			"planedIssueTime": "",
			"planedOnlineTime": "",
			"auditTime": "",
			"summary": "",
			"description": "",
			"status": "",
			"releaseType": ""
		}
	],
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


# 评分快照


## 获取当天最新一批评分快照


**接口地址**:`/ted-sbrain/scoreSnapshot/queryLatestToday`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`application/json`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|query||query|true|ScoreSnapshot|ScoreSnapshot|
|&emsp;&emsp;id|||false|string||
|&emsp;&emsp;createTs|||false|string(date-time)||
|&emsp;&emsp;updateTs|||false|string(date-time)||
|&emsp;&emsp;creator|||false|string||
|&emsp;&emsp;creatorId|||false|string||
|&emsp;&emsp;updater|||false|string||
|&emsp;&emsp;updaterId|||false|string||
|&emsp;&emsp;patchId|||false|integer(int64)||
|&emsp;&emsp;totalScore|||false|number||
|&emsp;&emsp;qualityScore|||false|number||
|&emsp;&emsp;behaviorScore|||false|number||
|&emsp;&emsp;riskLevel|||false|string||
|&emsp;&emsp;snapshotsTs|||false|string(date-time)||
|&emsp;&emsp;summary|||false|string||
|&emsp;&emsp;status|||false|string||
|&emsp;&emsp;releaseType|||false|string||
|&emsp;&emsp;description|||false|string||
|&emsp;&emsp;sysId|||false|string||
|&emsp;&emsp;systemName|||false|string||
|&emsp;&emsp;systemKeyId|||false|integer(int32)||
|&emsp;&emsp;systemLevel|||false|string||
|&emsp;&emsp;teamName|||false|string||
|&emsp;&emsp;patchOwner|||false|string||
|&emsp;&emsp;patchOwnerId|||false|string||
|&emsp;&emsp;testLeader|||false|string||
|&emsp;&emsp;testLeaderAccount|||false|string||
|&emsp;&emsp;devLeader|||false|string||
|&emsp;&emsp;devLeaderAccount|||false|string||
|&emsp;&emsp;testOwner|||false|string||
|&emsp;&emsp;testOwnerUserId|||false|string||
|&emsp;&emsp;testOwnerGroup|||false|string||
|&emsp;&emsp;planedTestFromTime|||false|string(date-time)||
|&emsp;&emsp;planedTestToTime|||false|string(date-time)||
|&emsp;&emsp;planedIssueTime|||false|string(date-time)||
|&emsp;&emsp;planedOnlineTime|||false|string(date-time)||
|&emsp;&emsp;auditTime|||false|string(date-time)||
|page||query|false|integer(int32)||
|pageSize||query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponsePageScoreSnapshot|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;records||array|ScoreSnapshot|
|&emsp;&emsp;&emsp;&emsp;id||string||
|&emsp;&emsp;&emsp;&emsp;createTs||string||
|&emsp;&emsp;&emsp;&emsp;updateTs||string||
|&emsp;&emsp;&emsp;&emsp;creator||string||
|&emsp;&emsp;&emsp;&emsp;creatorId||string||
|&emsp;&emsp;&emsp;&emsp;updater||string||
|&emsp;&emsp;&emsp;&emsp;updaterId||string||
|&emsp;&emsp;&emsp;&emsp;patchId||integer||
|&emsp;&emsp;&emsp;&emsp;totalScore||number||
|&emsp;&emsp;&emsp;&emsp;qualityScore||number||
|&emsp;&emsp;&emsp;&emsp;behaviorScore||number||
|&emsp;&emsp;&emsp;&emsp;riskLevel||string||
|&emsp;&emsp;&emsp;&emsp;snapshotsTs||string||
|&emsp;&emsp;&emsp;&emsp;summary||string||
|&emsp;&emsp;&emsp;&emsp;status||string||
|&emsp;&emsp;&emsp;&emsp;releaseType||string||
|&emsp;&emsp;&emsp;&emsp;description||string||
|&emsp;&emsp;&emsp;&emsp;sysId||string||
|&emsp;&emsp;&emsp;&emsp;systemName||string||
|&emsp;&emsp;&emsp;&emsp;systemKeyId||integer||
|&emsp;&emsp;&emsp;&emsp;systemLevel||string||
|&emsp;&emsp;&emsp;&emsp;teamName||string||
|&emsp;&emsp;&emsp;&emsp;patchOwner||string||
|&emsp;&emsp;&emsp;&emsp;patchOwnerId||string||
|&emsp;&emsp;&emsp;&emsp;testLeader||string||
|&emsp;&emsp;&emsp;&emsp;testLeaderAccount||string||
|&emsp;&emsp;&emsp;&emsp;devLeader||string||
|&emsp;&emsp;&emsp;&emsp;devLeaderAccount||string||
|&emsp;&emsp;&emsp;&emsp;testOwner||string||
|&emsp;&emsp;&emsp;&emsp;testOwnerUserId||string||
|&emsp;&emsp;&emsp;&emsp;testOwnerGroup||string||
|&emsp;&emsp;&emsp;&emsp;planedTestFromTime||string||
|&emsp;&emsp;&emsp;&emsp;planedTestToTime||string||
|&emsp;&emsp;&emsp;&emsp;planedIssueTime||string||
|&emsp;&emsp;&emsp;&emsp;planedOnlineTime||string||
|&emsp;&emsp;&emsp;&emsp;auditTime||string||
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;size||integer(int64)||
|&emsp;&emsp;current||integer(int64)||
|&emsp;&emsp;orders||array|OrderItem|
|&emsp;&emsp;&emsp;&emsp;column||string||
|&emsp;&emsp;&emsp;&emsp;asc||boolean||
|&emsp;&emsp;optimizeCountSql||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;searchCount||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;optimizeJoinOfCountSql||boolean||
|&emsp;&emsp;maxLimit||integer(int64)||
|&emsp;&emsp;countId||string||
|&emsp;&emsp;pages||integer(int64)||
|result||boolean||
|message||string||
|criticalProcess||ResponsePageScoreSnapshot_criticalProcess|ResponsePageScoreSnapshot_criticalProcess|


**响应示例**:
```javascript
{
	"data": {
		"records": [
			{
				"id": "",
				"createTs": "",
				"updateTs": "",
				"creator": "",
				"creatorId": "",
				"updater": "",
				"updaterId": "",
				"patchId": 0,
				"totalScore": 0,
				"qualityScore": 0,
				"behaviorScore": 0,
				"riskLevel": "",
				"snapshotsTs": "",
				"summary": "",
				"status": "",
				"releaseType": "",
				"description": "",
				"sysId": "",
				"systemName": "",
				"systemKeyId": 0,
				"systemLevel": "",
				"teamName": "",
				"patchOwner": "",
				"patchOwnerId": "",
				"testLeader": "",
				"testLeaderAccount": "",
				"devLeader": "",
				"devLeaderAccount": "",
				"testOwner": "",
				"testOwnerUserId": "",
				"testOwnerGroup": "",
				"planedTestFromTime": "",
				"planedTestToTime": "",
				"planedIssueTime": "",
				"planedOnlineTime": "",
				"auditTime": ""
			}
		],
		"total": 0,
		"size": 0,
		"current": 0,
		"orders": [
			{
				"column": "",
				"asc": true
			}
		],
		"optimizeCountSql": {},
		"searchCount": {},
		"optimizeJoinOfCountSql": true,
		"maxLimit": 0,
		"countId": "",
		"pages": 0
	},
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


## 分页查询


**接口地址**:`/ted-sbrain/scoreSnapshot/page`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`application/json`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|query||query|true|ScoreSnapshot|ScoreSnapshot|
|&emsp;&emsp;id|||false|string||
|&emsp;&emsp;createTs|||false|string(date-time)||
|&emsp;&emsp;updateTs|||false|string(date-time)||
|&emsp;&emsp;creator|||false|string||
|&emsp;&emsp;creatorId|||false|string||
|&emsp;&emsp;updater|||false|string||
|&emsp;&emsp;updaterId|||false|string||
|&emsp;&emsp;patchId|||false|integer(int64)||
|&emsp;&emsp;totalScore|||false|number||
|&emsp;&emsp;qualityScore|||false|number||
|&emsp;&emsp;behaviorScore|||false|number||
|&emsp;&emsp;riskLevel|||false|string||
|&emsp;&emsp;snapshotsTs|||false|string(date-time)||
|&emsp;&emsp;summary|||false|string||
|&emsp;&emsp;status|||false|string||
|&emsp;&emsp;releaseType|||false|string||
|&emsp;&emsp;description|||false|string||
|&emsp;&emsp;sysId|||false|string||
|&emsp;&emsp;systemName|||false|string||
|&emsp;&emsp;systemKeyId|||false|integer(int32)||
|&emsp;&emsp;systemLevel|||false|string||
|&emsp;&emsp;teamName|||false|string||
|&emsp;&emsp;patchOwner|||false|string||
|&emsp;&emsp;patchOwnerId|||false|string||
|&emsp;&emsp;testLeader|||false|string||
|&emsp;&emsp;testLeaderAccount|||false|string||
|&emsp;&emsp;devLeader|||false|string||
|&emsp;&emsp;devLeaderAccount|||false|string||
|&emsp;&emsp;testOwner|||false|string||
|&emsp;&emsp;testOwnerUserId|||false|string||
|&emsp;&emsp;testOwnerGroup|||false|string||
|&emsp;&emsp;planedTestFromTime|||false|string(date-time)||
|&emsp;&emsp;planedTestToTime|||false|string(date-time)||
|&emsp;&emsp;planedIssueTime|||false|string(date-time)||
|&emsp;&emsp;planedOnlineTime|||false|string(date-time)||
|&emsp;&emsp;auditTime|||false|string(date-time)||
|page||query|false|integer(int32)||
|pageSize||query|false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponsePageScoreSnapshot|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;records||array|ScoreSnapshot|
|&emsp;&emsp;&emsp;&emsp;id||string||
|&emsp;&emsp;&emsp;&emsp;createTs||string||
|&emsp;&emsp;&emsp;&emsp;updateTs||string||
|&emsp;&emsp;&emsp;&emsp;creator||string||
|&emsp;&emsp;&emsp;&emsp;creatorId||string||
|&emsp;&emsp;&emsp;&emsp;updater||string||
|&emsp;&emsp;&emsp;&emsp;updaterId||string||
|&emsp;&emsp;&emsp;&emsp;patchId||integer||
|&emsp;&emsp;&emsp;&emsp;totalScore||number||
|&emsp;&emsp;&emsp;&emsp;qualityScore||number||
|&emsp;&emsp;&emsp;&emsp;behaviorScore||number||
|&emsp;&emsp;&emsp;&emsp;riskLevel||string||
|&emsp;&emsp;&emsp;&emsp;snapshotsTs||string||
|&emsp;&emsp;&emsp;&emsp;summary||string||
|&emsp;&emsp;&emsp;&emsp;status||string||
|&emsp;&emsp;&emsp;&emsp;releaseType||string||
|&emsp;&emsp;&emsp;&emsp;description||string||
|&emsp;&emsp;&emsp;&emsp;sysId||string||
|&emsp;&emsp;&emsp;&emsp;systemName||string||
|&emsp;&emsp;&emsp;&emsp;systemKeyId||integer||
|&emsp;&emsp;&emsp;&emsp;systemLevel||string||
|&emsp;&emsp;&emsp;&emsp;teamName||string||
|&emsp;&emsp;&emsp;&emsp;patchOwner||string||
|&emsp;&emsp;&emsp;&emsp;patchOwnerId||string||
|&emsp;&emsp;&emsp;&emsp;testLeader||string||
|&emsp;&emsp;&emsp;&emsp;testLeaderAccount||string||
|&emsp;&emsp;&emsp;&emsp;devLeader||string||
|&emsp;&emsp;&emsp;&emsp;devLeaderAccount||string||
|&emsp;&emsp;&emsp;&emsp;testOwner||string||
|&emsp;&emsp;&emsp;&emsp;testOwnerUserId||string||
|&emsp;&emsp;&emsp;&emsp;testOwnerGroup||string||
|&emsp;&emsp;&emsp;&emsp;planedTestFromTime||string||
|&emsp;&emsp;&emsp;&emsp;planedTestToTime||string||
|&emsp;&emsp;&emsp;&emsp;planedIssueTime||string||
|&emsp;&emsp;&emsp;&emsp;planedOnlineTime||string||
|&emsp;&emsp;&emsp;&emsp;auditTime||string||
|&emsp;&emsp;total||integer(int64)||
|&emsp;&emsp;size||integer(int64)||
|&emsp;&emsp;current||integer(int64)||
|&emsp;&emsp;orders||array|OrderItem|
|&emsp;&emsp;&emsp;&emsp;column||string||
|&emsp;&emsp;&emsp;&emsp;asc||boolean||
|&emsp;&emsp;optimizeCountSql||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;searchCount||PageScoreSnapshot|PageScoreSnapshot|
|&emsp;&emsp;optimizeJoinOfCountSql||boolean||
|&emsp;&emsp;maxLimit||integer(int64)||
|&emsp;&emsp;countId||string||
|&emsp;&emsp;pages||integer(int64)||
|result||boolean||
|message||string||
|criticalProcess||ResponsePageScoreSnapshot_criticalProcess|ResponsePageScoreSnapshot_criticalProcess|


**响应示例**:
```javascript
{
	"data": {
		"records": [
			{
				"id": "",
				"createTs": "",
				"updateTs": "",
				"creator": "",
				"creatorId": "",
				"updater": "",
				"updaterId": "",
				"patchId": 0,
				"totalScore": 0,
				"qualityScore": 0,
				"behaviorScore": 0,
				"riskLevel": "",
				"snapshotsTs": "",
				"summary": "",
				"status": "",
				"releaseType": "",
				"description": "",
				"sysId": "",
				"systemName": "",
				"systemKeyId": 0,
				"systemLevel": "",
				"teamName": "",
				"patchOwner": "",
				"patchOwnerId": "",
				"testLeader": "",
				"testLeaderAccount": "",
				"devLeader": "",
				"devLeaderAccount": "",
				"testOwner": "",
				"testOwnerUserId": "",
				"testOwnerGroup": "",
				"planedTestFromTime": "",
				"planedTestToTime": "",
				"planedIssueTime": "",
				"planedOnlineTime": "",
				"auditTime": ""
			}
		],
		"total": 0,
		"size": 0,
		"current": 0,
		"orders": [
			{
				"column": "",
				"asc": true
			}
		],
		"optimizeCountSql": {},
		"searchCount": {},
		"optimizeJoinOfCountSql": true,
		"maxLimit": 0,
		"countId": "",
		"pages": 0
	},
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


## 列表查询


**接口地址**:`/ted-sbrain/scoreSnapshot/list`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`application/json`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|query||query|true|ScoreSnapshot|ScoreSnapshot|
|&emsp;&emsp;id|||false|string||
|&emsp;&emsp;createTs|||false|string(date-time)||
|&emsp;&emsp;updateTs|||false|string(date-time)||
|&emsp;&emsp;creator|||false|string||
|&emsp;&emsp;creatorId|||false|string||
|&emsp;&emsp;updater|||false|string||
|&emsp;&emsp;updaterId|||false|string||
|&emsp;&emsp;patchId|||false|integer(int64)||
|&emsp;&emsp;totalScore|||false|number||
|&emsp;&emsp;qualityScore|||false|number||
|&emsp;&emsp;behaviorScore|||false|number||
|&emsp;&emsp;riskLevel|||false|string||
|&emsp;&emsp;snapshotsTs|||false|string(date-time)||
|&emsp;&emsp;summary|||false|string||
|&emsp;&emsp;status|||false|string||
|&emsp;&emsp;releaseType|||false|string||
|&emsp;&emsp;description|||false|string||
|&emsp;&emsp;sysId|||false|string||
|&emsp;&emsp;systemName|||false|string||
|&emsp;&emsp;systemKeyId|||false|integer(int32)||
|&emsp;&emsp;systemLevel|||false|string||
|&emsp;&emsp;teamName|||false|string||
|&emsp;&emsp;patchOwner|||false|string||
|&emsp;&emsp;patchOwnerId|||false|string||
|&emsp;&emsp;testLeader|||false|string||
|&emsp;&emsp;testLeaderAccount|||false|string||
|&emsp;&emsp;devLeader|||false|string||
|&emsp;&emsp;devLeaderAccount|||false|string||
|&emsp;&emsp;testOwner|||false|string||
|&emsp;&emsp;testOwnerUserId|||false|string||
|&emsp;&emsp;testOwnerGroup|||false|string||
|&emsp;&emsp;planedTestFromTime|||false|string(date-time)||
|&emsp;&emsp;planedTestToTime|||false|string(date-time)||
|&emsp;&emsp;planedIssueTime|||false|string(date-time)||
|&emsp;&emsp;planedOnlineTime|||false|string(date-time)||
|&emsp;&emsp;auditTime|||false|string(date-time)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponseListScoreSnapshot|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||array|ScoreSnapshot|
|&emsp;&emsp;id||string||
|&emsp;&emsp;createTs||string(date-time)||
|&emsp;&emsp;updateTs||string(date-time)||
|&emsp;&emsp;creator||string||
|&emsp;&emsp;creatorId||string||
|&emsp;&emsp;updater||string||
|&emsp;&emsp;updaterId||string||
|&emsp;&emsp;patchId||integer(int64)||
|&emsp;&emsp;totalScore||number||
|&emsp;&emsp;qualityScore||number||
|&emsp;&emsp;behaviorScore||number||
|&emsp;&emsp;riskLevel||string||
|&emsp;&emsp;snapshotsTs||string(date-time)||
|&emsp;&emsp;summary||string||
|&emsp;&emsp;status||string||
|&emsp;&emsp;releaseType||string||
|&emsp;&emsp;description||string||
|&emsp;&emsp;sysId||string||
|&emsp;&emsp;systemName||string||
|&emsp;&emsp;systemKeyId||integer(int32)||
|&emsp;&emsp;systemLevel||string||
|&emsp;&emsp;teamName||string||
|&emsp;&emsp;patchOwner||string||
|&emsp;&emsp;patchOwnerId||string||
|&emsp;&emsp;testLeader||string||
|&emsp;&emsp;testLeaderAccount||string||
|&emsp;&emsp;devLeader||string||
|&emsp;&emsp;devLeaderAccount||string||
|&emsp;&emsp;testOwner||string||
|&emsp;&emsp;testOwnerUserId||string||
|&emsp;&emsp;testOwnerGroup||string||
|&emsp;&emsp;planedTestFromTime||string(date-time)||
|&emsp;&emsp;planedTestToTime||string(date-time)||
|&emsp;&emsp;planedIssueTime||string(date-time)||
|&emsp;&emsp;planedOnlineTime||string(date-time)||
|&emsp;&emsp;auditTime||string(date-time)||
|result||boolean||
|message||string||
|criticalProcess||ResponseListScoreSnapshot_criticalProcess|ResponseListScoreSnapshot_criticalProcess|


**响应示例**:
```javascript
{
	"data": [
		{
			"id": "",
			"createTs": "",
			"updateTs": "",
			"creator": "",
			"creatorId": "",
			"updater": "",
			"updaterId": "",
			"patchId": 0,
			"totalScore": 0,
			"qualityScore": 0,
			"behaviorScore": 0,
			"riskLevel": "",
			"snapshotsTs": "",
			"summary": "",
			"status": "",
			"releaseType": "",
			"description": "",
			"sysId": "",
			"systemName": "",
			"systemKeyId": 0,
			"systemLevel": "",
			"teamName": "",
			"patchOwner": "",
			"patchOwnerId": "",
			"testLeader": "",
			"testLeaderAccount": "",
			"devLeader": "",
			"devLeaderAccount": "",
			"testOwner": "",
			"testOwnerUserId": "",
			"testOwnerGroup": "",
			"planedTestFromTime": "",
			"planedTestToTime": "",
			"planedIssueTime": "",
			"planedOnlineTime": "",
			"auditTime": ""
		}
	],
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


## 主键查询


**接口地址**:`/ted-sbrain/scoreSnapshot/get/{id}`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`application/json`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id||path|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResponseScoreSnapshot|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|data||ScoreSnapshot|ScoreSnapshot|
|&emsp;&emsp;id||string||
|&emsp;&emsp;createTs||string(date-time)||
|&emsp;&emsp;updateTs||string(date-time)||
|&emsp;&emsp;creator||string||
|&emsp;&emsp;creatorId||string||
|&emsp;&emsp;updater||string||
|&emsp;&emsp;updaterId||string||
|&emsp;&emsp;patchId||integer(int64)||
|&emsp;&emsp;totalScore||number||
|&emsp;&emsp;qualityScore||number||
|&emsp;&emsp;behaviorScore||number||
|&emsp;&emsp;riskLevel||string||
|&emsp;&emsp;snapshotsTs||string(date-time)||
|&emsp;&emsp;summary||string||
|&emsp;&emsp;status||string||
|&emsp;&emsp;releaseType||string||
|&emsp;&emsp;description||string||
|&emsp;&emsp;sysId||string||
|&emsp;&emsp;systemName||string||
|&emsp;&emsp;systemKeyId||integer(int32)||
|&emsp;&emsp;systemLevel||string||
|&emsp;&emsp;teamName||string||
|&emsp;&emsp;patchOwner||string||
|&emsp;&emsp;patchOwnerId||string||
|&emsp;&emsp;testLeader||string||
|&emsp;&emsp;testLeaderAccount||string||
|&emsp;&emsp;devLeader||string||
|&emsp;&emsp;devLeaderAccount||string||
|&emsp;&emsp;testOwner||string||
|&emsp;&emsp;testOwnerUserId||string||
|&emsp;&emsp;testOwnerGroup||string||
|&emsp;&emsp;planedTestFromTime||string(date-time)||
|&emsp;&emsp;planedTestToTime||string(date-time)||
|&emsp;&emsp;planedIssueTime||string(date-time)||
|&emsp;&emsp;planedOnlineTime||string(date-time)||
|&emsp;&emsp;auditTime||string(date-time)||
|result||boolean||
|message||string||
|criticalProcess||ResponseScoreSnapshot_criticalProcess|ResponseScoreSnapshot_criticalProcess|


**响应示例**:
```javascript
{
	"data": {
		"id": "",
		"createTs": "",
		"updateTs": "",
		"creator": "",
		"creatorId": "",
		"updater": "",
		"updaterId": "",
		"patchId": 0,
		"totalScore": 0,
		"qualityScore": 0,
		"behaviorScore": 0,
		"riskLevel": "",
		"snapshotsTs": "",
		"summary": "",
		"status": "",
		"releaseType": "",
		"description": "",
		"sysId": "",
		"systemName": "",
		"systemKeyId": 0,
		"systemLevel": "",
		"teamName": "",
		"patchOwner": "",
		"patchOwnerId": "",
		"testLeader": "",
		"testLeaderAccount": "",
		"devLeader": "",
		"devLeaderAccount": "",
		"testOwner": "",
		"testOwnerUserId": "",
		"testOwnerGroup": "",
		"planedTestFromTime": "",
		"planedTestToTime": "",
		"planedIssueTime": "",
		"planedOnlineTime": "",
		"auditTime": ""
	},
	"result": true,
	"message": "",
	"criticalProcess": {
		"innerMap": {},
		"empty": true
	}
}
```


# System


## 健康检查


**接口地址**:`/ted-sbrain/health`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


暂无


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK||


**响应参数**:


暂无


**响应示例**:
```javascript

```