'use strict';

const CsdModeRootPath = '/home/admin/sas_assignment';
const CsdModeAssignmentFilePath = CsdModeRootPath + '/assignment';
const AnnotationUserContanierEnv = 'sas.cafe.sofastack.io/user-container-env';
const AnnotationSasContanierEnv = 'sas.cafe.sofastack.io/sas-container-env';
const AnnotationSasContext = 'sas.cafe.sofastack.io/sas-context';

module.exports = {
  get CsdModeRootPath() {
    return process.env.CSD_MODE_ROOT_PATH || CsdModeRootPath;
  },
  get CsdModeAssignmentFilePath() {
    return process.env.CSD_MODE_ASSIGNMENT_FILE_PATH || CsdModeAssignmentFilePath;
  },
  AnnotationUserContanierEnv,
  AnnotationSasContanierEnv,
  AnnotationSasContext,
};
