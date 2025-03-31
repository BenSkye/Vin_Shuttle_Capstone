
export const ValidationMessages = {
  string: {
    empty: '{#label} không được để trống',
    required: '{#label} là bắt buộc',
    min: '{#label} phải có ít nhất {#limit} ký tự',
    max: '{#label} không được vượt quá {#limit} ký tự',
  },
  number: {
    base: '{#label} phải là một số',
    required: '{#label} là bắt buộc',
    min: '{#label} phải lớn hơn {#limit}',
    max: '{#label} không được vượt quá {#limit}',
    integer: '{#label} phải là một số nguyên',
    positive: '{#label} phải là một số dương',
  },
  boolean: {
    base: '{#label} phải là boolean',
  },
  object: {
    base: '{#label} phải là một object',
  },
  array: {
    base: '{#label} phải là một mảng',
    min: '{#label} phải có ít nhất {#limit} phần tử',
    max: '{#label} không được vượt quá {#limit} phần tử',
  },
  any: {
    only: '{#label} không hợp lệ',
    required: '{#label} là bắt buộc',
    empty: '{#label} không được để trống',
  },
};
