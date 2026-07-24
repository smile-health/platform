interface ArrayListItem {
  [key: string]: string | number;
}

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

interface ParseErrorResult {
  code: number | null;
  errorMessage: string;
  errorField: Record<string, string[]> | string;
  message: string;
}

export const toArrayList = (
  arrayObject: any[],
  keyObject: string,
  valObject: string,
  key: string = 'value',
  val: string = 'label'
): ArrayListItem[] => {
  if (!arrayObject || arrayObject.length <= 0) {
    return [];
  }

  return arrayObject.map((arr: any, index: number) => ({
    [key]: arr[keyObject] ? arr[keyObject].toString() : index,
    [val]: arr[valObject] ? arr[valObject] : '',
  }));
};

export const parseError = (error: ErrorResponse): ParseErrorResult => {
  const resp = error.response ? error.response : null;
  const code = resp && resp.status ? resp.status : null;
  const errorMessage =
    resp && resp.data && resp.data.message
      ? resp.data.message
      : 'Maaf, terjadi kesalahan, Silakan coba lagi dalam beberapa saat';
  const errorField =
    resp && resp.data && resp.data.errors ? resp.data.errors : '';
  let message = errorMessage;

  if (
    parseInt(String(code)) === 422 &&
    errorField &&
    Object.values(errorField).length > 0
  ) {
    message = '';
  }

  if (errorField && Object.values(errorField).length > 0) {
    message += Object.values(errorField)
      .map((err: string[]) => err[0])
      .join(', ');
  }

  return {
    code,
    errorMessage,
    errorField,
    message,
  };
};

export function mapDataStringToLabel(
  list: { label: string; value: string }[],
  data?: string[]
) {
  return data
    ?.map((valueId) => {
      const datum = list.find((item) => item.value === valueId);
      if (datum) {
        return { label: datum.label, value: datum.value };
      }
      return null;
    })
    .filter((item) => item !== null);
}

export function mapDataNumberToLabel(
  list: { label: string; value: number }[],
  data?: number[]
) {
  return data
    ?.map((valueId) => {
      const datum = list.find((item) => item.value === valueId);
      if (datum) {
        return { label: datum.label, value: datum.value };
      }
      return null;
    })
    .filter((item) => item !== null);
}
