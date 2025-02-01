export const ValidationMessages = {
    string: {
        empty: '{#label} không được để trống',
        required: '{#label} là bắt buộc',
        min: '{#label} phải có ít nhất {#limit} ký tự',
        max: '{#label} không được vượt quá {#limit} ký tự'
    },
    boolean: {
        base: '{#label} phải là boolean'
    },
    object: {
        base: '{#label} phải là một object'
    },
    array: {
        base: '{#label} phải là một mảng'
    },
    any: {
        only: '{#label} không hợp lệ'
    }
};