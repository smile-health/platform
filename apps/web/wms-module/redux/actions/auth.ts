import { RequestloginResponse } from '@/types/auth';
import { ROLE_TYPE } from '@/types/roles';
import { parseError } from '@/utils/common';
import axios from 'axios';
import { showMessage } from './app';
import { toast } from '@repo/ui/components/toast';

export const AUTH_CHECK_TOKEN = 'AUTH_CHECK_TOKEN';
export const AUTH_RESULT_CHECK_TOKEN = 'AUTH_RESULT_CHECK_TOKEN';

const requestCheckToken = () => ({
  type: AUTH_CHECK_TOKEN,
});

const resultLogin = (data: any) => ({
  type: AUTH_RESULT_CHECK_TOKEN,
  payload: {
    data,
  },
});

export const checkToken = (token: string, locale: string) => (
  dispatch: any
) => {
  dispatch(requestCheckToken());
  return axios
    .get(`${process.env.WMS_API_URL}/set-auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data.data)
    .then((data: RequestloginResponse) => {
      // Map smile role to wms role
      const userData = { ...data };
      const { role_label, external_properties } = userData;
      if (role_label === 'Super Admin' && !external_properties) {
        userData.external_properties = {
          role: {
            id: 1,
            name: 'Super Admin',
            type: ROLE_TYPE.SUPER_ADMIN,
          },
        };
      }

      // AUTH_TOKEN is the shared Smile session cookie/localStorage entry —
      // it's already set correctly (path: '/') by Smile's own login. Do not
      // re-write it here: nookies.set without an explicit path used to scope
      // a duplicate cookie to the current page's directory (e.g. /wms/id),
      // which then shadowed the real one and went stale on the next login.
      localStorage.setItem(
        `${process.env.WMS_STORAGE_PREFIX}USER`,
        JSON.stringify(userData)
      );

      dispatch(
        showMessage(
          locale == 'id' ? 'Berhasil Login' : 'Successfully Login',
          'success'
        )
      );

      return dispatch(resultLogin(userData));
    })
    .catch((error) => {
      console.error(error);
      const { message } = parseError(error);

      dispatch(showMessage(message, 'danger'));

      const apiMessage = error?.response?.data?.data || message;
      toast.danger({
        description: apiMessage,
        duration: 10000,
      });

      return dispatch(resultLogin(null));
    });
};
