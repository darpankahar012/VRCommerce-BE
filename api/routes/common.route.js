const router = require('express').Router();
const commonCtrl = require('../controllers/common.controller');
const upload = require('../helpers/fileUpload.helper');

/** POST /api/common/single-upload - upload single file */
router.post('/single-upload', upload.single('file'), commonCtrl.singleUpload);

/** POST /api/common/single-upload - upload multiple files */
router.post('/multiple-upload', upload.array('files', 5), commonCtrl.multipleUpload);

module.exports = router;
