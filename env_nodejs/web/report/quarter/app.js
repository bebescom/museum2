require('../../../lib/logs').nolog();

var tool = require('../../../lib/tool');
// console.log(process.argv);
var cli_args = process.argv.slice(2);

var date = cli_args[0];
var cl_param = cli_args[1];
var show = cli_args[2];
if (!date) {
    date = tool.date('Ym');
}
if (date === 'img' || date === 'docx') {
    require('./' + date)['generate_' + date](cl_param, function () {
        process.exit(0);
    });
    return;
}
if (date === 'imgdocx') {
    require('./img').generate_img(cl_param, function () {
        require('./docx').generate_docx(cl_param, function () {
            process.exit(0);
        });
    });
    return;
}
require('./index').start(date, cl_param);
