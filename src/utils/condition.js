let CONDITIONOPER = {
    'Equal': 1,
    'Unequal': 2,
    'GreaterThan': 3,
    'GreaterThanEqual': 4,
    'LessThanEqual': 5,
    'LessThan': 6,
    'LeftLike': 7,
    'RightLike': 8,
    'AllLike': 9,
    'Exclusive': 10,
    'In': 11,
    'NotIn': 12,
    'Exists': 13,
    'NotExists': 14
}
let CONDITIONRELATION = {
    'And': 1,
    'Or': 2
}
let DATATYPE = {
    'String': 1,
    'Int': 2,
    'Decimal': 3,
    'Boolean': 4,
    'DateTime': 5,
}

let CONDITIONDIRECTION = {
    'ASC': 1,
    'DESC': 2
}
  

// let ConditionInfo  = {
//     'columnName': undefined,
//     'operator': CONDITIONOPER = CONDITIONOPER.Equal,
//     'relation': CONDITIONRELATION = CONDITIONRELATION.And,
//     'dataType': DATATYPE,
//     'group': undefined,
//     'groupRelation': CONDITIONRELATION = CONDITIONRELATION.And,
//     'alias': undefined,
//     'value': undefined
// }

export default {
    ConditionOperEnum: CONDITIONOPER,
    ConditionRelationEnum: CONDITIONRELATION,
    DataTypeEnum: DATATYPE,
    SortEnum: CONDITIONDIRECTION
}

