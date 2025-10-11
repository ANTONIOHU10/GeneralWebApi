import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  // example state
  example: string;
  // 应用状态接口 - 后续根据需要添加
}

export const reducers: ActionReducerMap<AppState> = {
  example: (state = 'example') => {
    return state;
  },
};
