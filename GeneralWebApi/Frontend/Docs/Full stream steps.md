时间轴：用户点击删除 → 返回处理

T0: 用户点击删除按钮
↓
T1: Component.onDeleteEmployee() 被调用
↓
T2: DialogService.confirm() 显示对话框
↓
T3: 用户点击"确认"
↓
T4: confirm$ Observable 发出 true
↓
T5: filter(confirmed => confirmed) 通过
↓
T6: OperationNotificationService.trackOperation() 记录操作
↓
T7: EmployeeFacade.deleteEmployee() 被调用
↓
T8: Store.dispatch(deleteEmployee Action)
↓
T9: Reducer 处理 deleteEmployee Action
→ Store 状态更新: operationInProgress.loading = true
↓
T10: Selector 重新计算 operationInProgress
↓
T11: operationInProgress$ Observable 发出新值
→ { loading: true, operation: 'delete', employeeId: '123' }
↓
T12: OperationNotificationService 收到状态变化
→ 检测到 !wasLoading && isLoading
→ 显示加载指示器 "Deleting employee..."
↓
T13: Effect.deleteEmployee$ 监听到 Action
↓
T14: EmployeeService.deleteEmployee() 调用 HTTP
↓
T15: HTTP DELETE /api/employees/123 发送到服务器
↓
T16: 服务器处理请求（删除数据库记录）
↓
T17: 服务器返回响应（成功或失败）
↓
T18: Effect 收到 HTTP 响应
→ 成功: dispatch(deleteEmployeeSuccess)
→ 失败: dispatch(deleteEmployeeFailure)
↓
T19: Reducer 处理 Success/Failure Action
→ 成功: 更新 Store (移除员工，loading = false)
→ 失败: 更新 Store (保存错误，loading = false)
↓
T20: Selector 重新计算
→ operationInProgress$ 发出新值
→ error$ 可能发出新值（如果失败）
↓
T21: OperationNotificationService 收到状态变化
→ 检测到 wasLoading && !isLoading
→ 隐藏加载指示器
→ 如果成功且无错误: 显示成功通知
→ 如果有错误: 显示错误通知（已在 T20 处理）
↓
T22: reloadEmployeesAfterDelete$ Effect 监听到 deleteEmployeeSuccess
↓
T23: 自动分发 loadEmployees Action
↓
T24: loadEmployees$ Effect 调用 HTTP GET
↓
T25: 获取最新员工列表
↓
T26: loadEmployeesSuccess Action 分发
↓
T27: Reducer 更新 employees 列表
↓
T28: employees$ Observable 发出新值
↓
T29: Component 模板自动更新（显示新列表）
↓
