import { ActionReducerMap } from '@ngrx/store';
import { employeeReducer } from './employee/employee.reducer';
import { EmployeeState } from './employee/employee.state';
import { departmentReducer } from './department/department.reducer';
import { DepartmentState } from './department/department.state';

export interface AppState {
  // example state
  example: string;
  // Employee state
  employee: EmployeeState;
  // Department state
  department: DepartmentState;
  // 应用状态接口 - 后续根据需要添加
}

export const reducers: ActionReducerMap<AppState> = {
  example: (state = 'example') => {
    return state;
  },
  employee: employeeReducer,
  department: departmentReducer,
};
