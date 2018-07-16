<?php

/**
 * Class Quarter_model quarter
 *
 */
class Quarter_model extends MY_Model
{
    /**
     * @var \PhpOffice\PhpWord\PhpWord
     */
    var $phpWord;
    /**
     * @var \PhpOffice\PhpWord\Element\Section
     */
    var $section;

    var $report;

    var $contents = array();//文字
    var $images = array();//图片
    var $tableDescs = array();//数据描述性统计量
    var $tableStdDays = array();//日波动及标准差统计表
    var $tableStdDates = array();//日波动、标准差极值发生的日期列表

    var $firstLine = array('indentation' => array('firstLine' => 600));
    var $alignCenter;
    var $font5_bold = array('size' => 10.5, 'bold' => true);
    var $font5 = array('size' => 10.5);
    var $td_style = array('valign' => 'center');
    var $th_style = array('bold' => true, 'valign' => 'center', 'borderBottomSize' => 6, 'borderColor' => '000');


    var $all_envs = array();//所有环境
    var $hall_tree = array();//楼层加展厅
    var $storerooms_floor_tree = array();//库房的楼层

    var $image_index = 1;//图片序号
    var $table_index = 1;//表序号

    function write_docx($report, $file_path)
    {
        $this->load->library('phpword');
        $myPhpWord = new Phpword();
        list($this->phpWord, $this->section) = $myPhpWord->generate();

        $this->alignCenter = array('align' => \PhpOffice\PhpWord\SimpleType\Jc::CENTER);

        $this->_get_data($report);//获取数据

        $this->_first();//封面
        $this->_topc();//目录
        $this->_standard();//标准依据
        $this->_museum();//博物馆完整数据综合分析
        $this->_hall();//展厅区监测数据记录及分析
        $this->_storeroom();//库房区监测数据记录及分析
        $this->_box();//箱线图解释

        try {
            $myPhpWord->save($file_path);
        } catch (Exception $e) {
            return '保存文件word失败';
        }
        return true;
    }

    /**
     * 获取数据
     * @param $report
     */
    function _get_data($report)
    {
        $this->report = $report;

        $list = M('images')->fetAll("report_id='" . $report['id'] . "'", "image_key,image_url");
        $kv = array();
        $os_name = PHP_OS;
        foreach ($list as $row) {
            $image_url = $row['image_url'];
            if (strpos($os_name, "WIN") !== false) {
                $image_url = mb_convert_encoding($image_url, "gbk", "utf-8");
            }
            $kv[$row['image_key']] = $image_url;
        }
        $this->images = $kv;

        $list = M('content')->fetAll("report_id='" . $report['id'] . "'", "content_key,content_value");
        $kv = array();
        foreach ($list as $row) {
            $kv[$row['content_key']] = $row['content_value'];
        }
        $kv['museum_name'] = $report['museum_name'];
        $kv['报告名称'] = $report['report_name'];
        $kv['报告时间范围'] = $report['report_time_range'];
        $kv['生成时间'] = date('Y-m-d', $report['generate_time']);
        $kv['展厅名称'] = '';
        $this->contents = $kv;

        $list = M('table_data_desc')->fetAll("report_id='" . $report['id'] . "'");
        $kv = array();
        foreach ($list as $row) {
            if (!isset($kv[$row['sheet_name']])) {
                $kv[$row['sheet_name']] = array();
            }
            $kv[$row['sheet_name']][] = $row;
        }
        $this->tableDescs = $kv;

        $list = M('table_rang_std_day')->fetAll("report_id='" . $report['id'] . "'");
        $kv = array();
        foreach ($list as $row) {
            if (!isset($kv[$row['sheet_name']])) {
                $kv[$row['sheet_name']] = array();
            }
            $kv[$row['sheet_name']][] = $row;
        }
        $this->tableStdDays = $kv;

        $list = M('table_rang_std_date')->fetAll("report_id='" . $report['id'] . "'");
        $kv = array();
        foreach ($list as $row) {
            if (!isset($kv[$row['sheet_name']])) {
                $kv[$row['sheet_name']] = array();
            }
            $kv[$row['sheet_name']][] = $row;
        }
        $this->tableStdDates = $kv;


        $envs = API('get/base/envs');
        if ($envs && isset($envs['error'])) {
            return $envs['error'];
        }
        $all_envs = array();
        $halls_tree = array(); //array('楼层1no'=>array('展厅1no','展厅2no'),'楼层2no'=>array('展厅3no','展厅4no'),'无上级的展厅no'=>'')
        $storerooms_tree = array();//array('库房楼栋1no'=>array('库房楼层1no','库房楼层2no'),'库房楼栋2no'=>array('库房楼层3no','库房楼层4no'),'无上级的库房楼层no'=>'')
        foreach ($envs['rows'] as $env) {
            $env['children'] = array();
            $all_envs[$env['env_no']] = $env;
            if ($env['type'] == '展厅') {
                if ($env['parent_env_no']) {
                    if (!isset($halls_tree[$env['parent_env_no']])) {
                        $halls_tree[$env['parent_env_no']] = array();
                    }
                    $halls_tree[$env['parent_env_no']][] = $env['env_no'];
                } else {
                    $halls_tree[$env['env_no']] = '';
                }
            } else if ($env['type'] == '库房') {
                if ($env['parent_env_no']) {
                    if (!isset($storerooms_tree[$env['parent_env_no']])) {
                        $storerooms_tree[$env['parent_env_no']] = array();
                    }
                    $storerooms_tree[$env['parent_env_no']][] = $env['env_no'];
                } else {
                    $storerooms_tree[$env['env_no']] = '';
                }
            }
        }
        foreach ($envs['rows'] as $env) {
            if ($env['parent_env_no']) {
                $all_envs[$env['parent_env_no']]['children'][] = $env['env_no'];
            }
        }
        $storerooms_floor_tree = array();
        foreach ($storerooms_tree as $env_no => $row) {
            $parent_env_no = $all_envs[$env_no]['parent_env_no'];
            if (!empty($parent_env_no)) {
                if (!isset($storerooms_floor_tree[$parent_env_no])) {
                    $storerooms_floor_tree[$parent_env_no] = array();
                }
                $storerooms_floor_tree[$parent_env_no][] = $env_no;
            } else {
                $storerooms_floor_tree[$env_no] = '';
            }
        }

        $this->hall_tree = $halls_tree;
        $this->all_envs = $all_envs;
        $this->storerooms_floor_tree = $storerooms_floor_tree;

    }


    function _first()
    {
        $section = $this->section;

        $header = $section->addHeader();
        $header->firstPage();

        $footer = $section->addFooter();
        $footer->addPreserveText('重庆声光电智联电子有限公司 版权所有                 当前第{PAGE}页/共{NUMPAGES}页', ['size' => 9, 'color' => '000', 'name' => '宋体'], $this->alignCenter);

        $section->addTextBreak(4, array('size' => 30), $this->alignCenter);

        $this->_addPCenter('{museum_name}', array('size' => 26, 'bold' => true, 'name' => '黑体'));
        $this->_addPCenter('{报告名称}', array('size' => 16, 'bold' => true, 'name' => '黑体'));
        $this->_addPCenter('（{报告时间范围}）', array('size' => 16, 'bold' => true, 'name' => '黑体'));
        $this->_addPCenter('预防性保护评估报告', array('size' => 22, 'bold' => true, 'name' => '黑体'));

        $section->addTextBreak(10, array('size' => 10.5), $this->alignCenter);

        $this->_addPCenter('建设单位：重庆声光电智联电子有限公司');
        $this->_addPCenter('{生成时间}');

        $section->addPageBreak();

    }

    function _topc()
    {
        $section = $this->section;
        $section->addText('目录', array('size' => 22, 'bold' => true, 'name' => '黑体'), $this->alignCenter);
        $fontStyle12 = array('size' => 14);
        $toc2 = $section->addTOC($fontStyle12);
        $section->addPageBreak();
    }

    /**
     * 标准
     */
    function _standard()
    {
        $section = $this->section;

        $section->addTitle($this->_replace('{museum_name}预防性保护项目'), 1);

        $this->_addP('本项目主要是针对{museum_name}文物库房与陈列展示厅文物保存环境质量监测与调控，建立比较完善的{museum_name}文物保存环境监测系统，运用多种调控手段和配置环境友好型文物囊匣，对文物保存微环境实施有效的“稳定、适宜”调控，配置适合目前工作的文物修复与保护用装备与仪器，形成馆藏文物预防性风险管理机制，完整建立{museum_name}馆藏文物保存环境监测站，提升该单位馆藏文物的预防性保护的综合能力。');

        $section->addTitle('无线监测终端监测标准', 2);

        $this->_addP('监测终端的布设及分析是根据2014年3月上海馆藏文物预防性保护技术成果交流会提供的影响文物相关因素进行布放，具体数据如下表所示：');

        $section->addPageBreak();

        $section->addText('表 1-1 文物预防性保护标准参考值', array('size' => 12), $this->alignCenter);

        $styleTable = array('borderSize' => 6, 'borderColor' => '000', 'width' => '100%', 'cellMargin' => 60,);
        $this->phpWord->addTableStyle('standard', $styleTable);
        $table = $section->addTable('standard');

        $font5_bold = array('size' => 10.5, 'bold' => true);
        $font5 = array('size' => 10.5);
        $bg_valign_center = array('bgColor' => '#CBCBCB', 'valign' => 'center');
        $valign = array('valign' => 'center');
        $bg_bold_valign_center = array('bgColor' => '#CBCBCB', 'bold' => true, 'valign' => 'center');
        $span2_center = array('gridSpan' => 2, 'vMerge' => 'restart', 'valign' => 'center');
        $span3_center = array('gridSpan' => 3, 'vMerge' => 'restart', 'valign' => 'center');
        $span5_center = array('gridSpan' => 5, 'vMerge' => 'restart', 'valign' => 'center');
        $span10_center = array('gridSpan' => 10, 'vMerge' => 'restart', 'valign' => 'center');

        $table->addRow(400);
        $table->addCell(3000, $bg_bold_valign_center)->addText('项目', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('石质', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('陶器', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('瓷器', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('铁质', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('青铜', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('纸质', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('壁画', $font5_bold, $this->alignCenter);
        $table->addCell(1200, $bg_bold_valign_center)->addText('纺织品', $font5_bold, $this->alignCenter);
        $table->addCell(1200, $bg_bold_valign_center)->addText('漆木器', $font5_bold, $this->alignCenter);
        $table->addCell(1000, $bg_bold_valign_center)->addText('其他', $font5_bold, $this->alignCenter);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('温度（℃）', $font5);
        $table->addCell(1000, array('gridSpan' => 10, 'vMerge' => 'restart'))->addText('18～22±2（根据当地平均温度设定，不低于10℃，不高于30℃）', $font5);

        $table->addRow(900);
        $table->addCell(3000, $bg_valign_center)->addText('湿度（％）', $font5);
        $table->addCell(1000, $span3_center)->addText('35～65±5（根据当地平均湿度设定）', $font5);
        $table->addCell(1000, $span2_center)->addText('＜45', $font5);
        $table->addCell(1000, $span5_center)->addText('35～65±5（根据当地平均湿度设定）', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('温度日波动（℃/d）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜4', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('湿度日波动（％/d）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜5', $font5);

        $table->addRow(500);
        $table->addCell(3000, $bg_valign_center)->addText('照度（lx）', $font5);
        $table->addCell(1000, $span5_center)->addText('≤300（含有彩绘的≤50，银器≤150）', $font5);
        $table->addCell(1000, $span3_center)->addText('≤50', $font5);
        $table->addCell(1000, $span2_center)->addText('≤150', $font5);

        $table->addRow(600);
        $table->addCell(3000, $bg_valign_center)->addText('累积照度（lx·h/年）', $font5);
        $table->addCell(1000, $span5_center)->addText('不限制（含有彩绘的≤50,000，银器≤360,000）', $font5);
        $table->addCell(1000, $span3_center)->addText('≤50,000', $font5);
        $table->addCell(1000, $span2_center)->addText('≤360,000', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('紫外线含量', $font5);
        $table->addCell(1000, $span10_center)->addText('＜20', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('SO2（ppb）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜4', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('NO2（ppb）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜5', $font5);

        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('O3（ppb）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜5', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('H2S（ppt）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜500', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('COS（ppt）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜500', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('甲酸（μg/m3）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜100', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('乙酸（μg/m3）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜250', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('NH3', $font5);
        $table->addCell(1000, $span10_center)->addText('＜100', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('甲醛（ppb）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜80', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('VOC（ppb）', $font5);
        $table->addCell(1000, $span10_center)->addText('＜300', $font5);
        $table->addRow();
        $table->addCell(3000, $bg_valign_center)->addText('颗粒物PM2.5', $font5);
        $table->addCell(1000, $span10_center)->addText('＜75', $font5);

    }

    /**
     * 博物馆完整数据综合分析
     */
    function _museum()
    {
        $section = $this->section;

        $section->addPageBreak();

        $section->addTitle('监控数据分析及调控建议', 1);

        $this->_addP('根据已布设在馆内的监测点监测所得数据，截取了{museum_name}{报告名称}的完整数据进行分析，以助于后续文物保护工作的展开。');

        $section->addTitle($this->_replace('{museum_name}完整数据综合分析'), 2);

        if (!empty($this->images['各展厅温度箱型图']) || !empty($this->images['各库房温度箱型图'])) {

            $section->addTitle('温度', 3);

            if (!empty($this->images['各展厅温度箱型图'])) {
                $this->_addImage('各展厅温度箱型图');
                $this->_addP('展厅温度范围为{展厅温度最小值}℃~{展厅温度最大值}℃，全距（极大值与极小值之差）为{展厅温度全距最小值}℃~{展厅温度全距最大值}℃，标准差为{展厅温度标准差最小值}℃~{展厅温度标准差最大值}℃，均值为{展厅温度均值最小值}℃~{展厅温度均值最大值}℃。极小值出现在{展厅温度最小值环境}，极大值出现在{展厅温度最大值环境}，整体温度{展厅温度描述}。');
            }
            if (!empty($this->images['各库房温度箱型图'])) {
                $this->_addImage('各库房温度箱型图');
                $this->_addP('库房温度范围为{库房温度最小值}℃~{库房温度最大值}℃，全距（极大值与极小值之差）为{库房温度全距最小值}℃~{库房温度全距最大值}℃，标准差为{库房温度标准差最小值}℃~{库房温度标准差最大值}℃，均值为{库房温度均值最小值}℃~{库房温度均值最大值}℃。极小值出现在{库房温度最小值环境}，极大值出现在{库房温度最大值环境}，整体温度{库房温度描述}。');
            }
        }
        if (!empty($this->images['各展厅湿度箱型图']) || !empty($this->images['各库房湿度箱型图'])) {

            $section->addTitle('湿度', 3);

            if (!empty($this->images['各展厅湿度箱型图'])) {
                $this->_addImage('各展厅湿度箱型图');
                $this->_addP('展厅湿度范围为{展厅湿度最小值}%~{展厅湿度最大值}%，全距（极大值与极小值之差）为{展厅湿度全距最小值}%~{展厅湿度全距最大值}%，标准差为{展厅湿度标准差最小值}%~{展厅湿度标准差最大值}%，均值为{展厅湿度均值最小值}%~{展厅湿度均值最大值}%。极小值出现在{展厅湿度最小值环境}，极大值出现在{展厅湿度最大值环境}，整体湿度{展厅湿度描述}。');
            }
            if (!empty($this->images['各库房湿度箱型图'])) {
                $this->_addImage('各库房湿度箱型图');
                $this->_addP('库房湿度范围为{库房湿度最小值}%~{库房湿度最大值}%，全距（极大值与极小值之差）为{库房湿度全距最小值}%~{库房湿度全距最大值}%，标准差为{库房湿度标准差最小值}%~{库房湿度标准差最大值}%，均值为{库房湿度均值最小值}%~{库房湿度均值最大值}%。极小值出现在{库房湿度最小值环境}，极大值出现在{库房湿度最大值环境}，整体湿度{库房湿度描述}。');
            }
        }
        if (!empty($this->images['各区域光照均峰图'])) {
            $section->addTitle('光照', 3);
            $this->_addImage('各区域光照均峰图');
            $this->_addP("上图为{museum_name}的光照数据。");
            $this->_addP('由图可知，{馆内光照最大值环境}的光照值最高，最大值为{馆内最高光照}lx，整体{馆内光照描述}。');
        }
        if (!empty($this->images['各区域紫外均峰图'])) {
            $section->addTitle('紫外', 3);
            $this->_addImage('各区域紫外均峰图');
            $this->_addP("上图为{museum_name}的紫外数据。");
            $this->_addP('由图可知， {馆内紫外最大值环境}的紫外值较高，最大值为{馆内最高紫外}μw/cm2，整体{馆内紫外描述}。');
        }
        if (!empty($this->images['各区域CO2箱型图'])) {
            $section->addTitle('CO2', 3);
            $this->_addImage('各区域CO2箱型图');
            $this->_addP("上图为{museum_name}各区域CO2箱型图。");
            $this->_addP('由图可知，馆内CO2均在{馆内CO2最小值}ppm~{馆内CO2最大值} ppm之间，整体{馆内CO2描述}，{馆内CO2阈值范围内的数据占比}的CO2数据低于{馆内CO2阈值}ppm。');
            $this->_addTableDesc('各区域CO2数据描述性统计量');
        }
        if (!empty($this->images['各区域VOC箱型图'])) {

            $section->addTitle('VOC', 3);
            $this->_addImage('各区域VOC箱型图');
            $this->_addP("上图为{museum_name}各区域VOC箱型图。");
            $this->_addP('由图可知，馆内VOC均在{馆内VOC最小值}ppb~{馆内VOC最大值} ppb之间，整体含量{馆内VOC描述}，{馆内VOC阈值范围内的数据占比}的VOC数据低于{馆内VOC阈值}ppb。');
            $this->_addTableDesc('各区域VOC数据描述性统计量');

        }

    }

    /**
     * 展厅区监测数据记录及分析
     */
    function _hall()
    {
        if (count($this->hall_tree) == 0) {
            return;
        }
        $section = $this->section;
        $this->contents['展厅库房'] = '展厅';
        $section->addTitle('展厅区监测数据记录及分析', 2);

        //array('楼层1no'=>array('展厅1no','展厅2no'),'楼层2no'=>array('展厅3no','展厅4no'),'无楼层的展厅no'=>'')
        foreach ($this->hall_tree as $parent_env_no => $envs) {
            if (!isset($this->all_envs[$parent_env_no])) {
                continue;
            }

            if (empty($envs)) {//无楼层显示展厅
                $this->_hall_one($parent_env_no, 3);
                continue;
            }
            $section->addTitle($this->all_envs[$parent_env_no]['name'], 3);//楼层名称

            foreach ($envs as $env_no) {
                $this->_hall_one($env_no, 4);
            }
        }

    }

    /**
     * 库房区监测数据记录及分析
     */
    function _storeroom()
    {
        if (count($this->storerooms_floor_tree) == 0) {
            return;
        }

        $section = $this->section;
        $this->contents['展厅库房'] = '库房';
        $section->addTitle('库房区监测数据记录及分析', 2);

        //array('库房楼栋1no'=>array('库房楼层1no','库房楼层2no'),'库房楼栋2no'=>array('库房楼层3no','库房楼层4no'),'无上级的库房楼层no'=>'')
        foreach ($this->storerooms_floor_tree as $parent_env_no => $envs) {
            if (!isset($this->all_envs[$parent_env_no])) {
                continue;
            }

            if (empty($envs)) {//无上级的库房楼层
                $this->_hall_one($parent_env_no, 3);
                continue;
            }
            $section->addTitle($this->all_envs[$parent_env_no]['name'], 3);//楼层名称

            foreach ($envs as $env_no) {
                $this->_hall_one($env_no, 4);
            }
        }

    }

    /**
     * 箱型图解释
     */
    function _box()
    {
        $section = $this->section;
        $section->addPageBreak();
        $font = array('name' => '宋体');
        $section->addTitle('附件一：箱型图解释', 1);
        $section->addImage(dirname(__FILE__) . '/../box.png', array_merge(array('width' => 400), $this->alignCenter));
        $this->_addP('Q1为第一四分位数或第25百分位数。', $font);
        $this->_addP('Q1位置计算公式为：i=(25/100)n', $font);
        $this->_addP('所得结果如果为整数，则Q1为所有数据升序排列后第i个数与第（i+1）个数的平均值；如果不是整数则i向上取整。', $font);
        $this->_addP('Q2为第二四分位数或第50百分位数，（也称中位数）。', $font);
        $this->_addP('Q2位置计算公式为：i=(50/100)n', $font);
        $this->_addP('所得结果如果为整数，则Q2为所有数据升序排列后第i个数与第（i+1）个数的平均值；如果不是整数则i向上取整。', $font);
        $section->addTextBreak();
        $this->_addP('Q3为第三四分位数或第75百分位数。', $font);
        $this->_addP('Q3位置计算公式为：i=(75/100)n', $font);
        $this->_addP('所得结果如果为整数，则Q3为所有数据升序排列后第i个数与第（i+1）个数的平均值；如果不是整数则i向上取整。', $font);
        $section->addTextBreak();
        $this->_addP('IQR为四分位数间距，IQR=Q3-Q1', $font);
        $section->addTextBreak();
        $this->_addP('下限：距离Q1 1.5个IQR，如果全部数据的最小值大于此值，则下限为数据的最小值，此时下方没有异常值。', $font);
        $this->_addP('上限：距离Q3 1.5个IQR，如果全部数据的最大值小于此值，则上限为数据的最大值，此时上方没有异常值。', $font);

    }

    /**
     * 单个展厅
     * @param $env_no
     * @param int $index
     */
    function _hall_one($env_no, $index = 4)
    {
        if (!isset($this->all_envs[$env_no])) {
            return;
        }

        $this->contents['展厅名称'] = $hall_name = $this->all_envs[$env_no]['name'];
        if (empty($this->contents[$hall_name])) {
            return;
        }

        $this->section->addTitle($hall_name, $index);
        $this->_addImage('{展厅名称}平面图');

        $this->_hall_temperature($env_no, $index + 1);
        $this->_hall_humidity($env_no, $index + 1);
        $this->_hall_light($env_no, $index + 1);
        $this->_hall_uv($env_no, $index + 1);
        $this->_hall_co2($env_no, $index + 1);
        $this->_hall_voc($env_no, $index + 1);
        $this->_hall_regulation($env_no, $index + 1);

    }

    /**
     * 展厅温度
     * @param $env_no
     * @param int $index
     */
    function _hall_temperature($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];
        if (empty($this->contents[$hall_name . '温度'])) {
            return;
        }
        $this->section->addTitle('温度', $index);

        $this->_addP('馆藏文物保存环境的温度重点关注其稳定与洁净，基于以上两点对数据做了以下分析，以评估该环境的预防性保护效果。');
        $this->_addP('为体现{展厅名称}内各监测点{报告名称}预防性保护工作的整体概况，做出了相应的箱型图。');

        $this->_addImage('{展厅名称}温度箱型图');

        $this->_addP('上面的箱型图中体现了数据的整体分布情况。');

        if (!empty($this->contents[$hall_name . '小环境温度'])) {
            $this->_addP('{展厅名称}小环境温度范围为{{展厅名称}小环境温度最小值}℃~{{展厅名称}小环境温度最大值}℃，最小值出现在{{展厅名称}小环境温度最小值环境}，最大值出现在{{展厅名称}小环境温度最大值环境}，各监测点温度{{展厅名称}小环境温度描述}。');
        }
        if (!empty($this->contents[$hall_name . '微环境温度'])) {
            $this->_addP('{展厅名称}微环境温度范围为{{展厅名称}微环境温度最小值}℃~{{展厅名称}微环境温度最大值}℃，最小值出现在{{展厅名称}微环境温度最小值环境}，最大值出现在{{展厅名称}微环境温度最大值环境}，各监测点温度{{展厅名称}微环境温度描述}。');
        }
        $this->_addP('下面是{展厅名称}全部数据的描述性统计量表格：');
        $this->_addTableDesc('{展厅名称}温度数据描述性统计量');
        $this->_addP('上表可以看出{{展厅名称}温度标准差描述}。');

        $this->_addP('为统观{展厅名称}的数据情况，做出了各个监测点的均峰图及标准差条形图。');
        $this->_addImage('{展厅名称}温度均峰图');
        $this->_addImage('{展厅名称}温度标准差条形图');

        $this->_addP('日波动同样是观察环境稳定与否的指标之一，因此计算出了每个监测点{报告名称}每天的波动值及其标准差，即{报告名称}全部的日波动值及日标准差，并作出了均峰图。');
        $this->_addImage('{展厅名称}温度日波动均峰图');

        $this->_addImage('{展厅名称}温度标准差均峰图');

        $this->_addTableStdDay('{展厅名称}温度日波动及标准差统计表');
        $this->_addP('通过以上图表可以看出该环境{{展厅名称}温度日波动描述}，下表为极值相应的日期。');

        $this->_addTableStdDate('{展厅名称}温度日波动、标准差极值发生的日期列表');
        $this->_addP('从表中可以看出，{{展厅名称}温度稳定性较差日期}的温度数据稳定性表现较差，{{展厅名称}温度稳定性较好日期}稳定性较好。');

        $this->_addP('为探究日波动与日期之间的关系，下面计算出该环境每天所有监测点数据波动范围（即该监测点当日数据极大值-当日数据极小值）的整体平均值，做出日历图，如下：');

        $this->_addImage('{展厅名称}温度日波动日历图');

    }

    /**
     * 展厅湿度
     * @param $env_no
     * @param int $index
     */
    function _hall_humidity($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];
        if (empty($this->contents[$hall_name . '湿度'])) {
            return;
        }
        $this->section->addTitle('湿度', $index);

        $this->_addP('馆藏文物保存环境的湿度重点关注其稳定与洁净，基于以上两点对数据做了以下分析，以评估该环境的预防性保护效果。');
        $this->_addP('为体现{展厅名称}内各监测点{报告名称}预防性保护工作的整体概况，做出了相应的箱型图。');

        $this->_addImage('{展厅名称}湿度箱型图');

        $this->_addP('上面的箱型图中体现了数据的整体分布情况。');
        if (!empty($this->contents[$hall_name . '小环境湿度'])) {
            $this->_addP('由图可知，{展厅名称}小环境湿度范围为{{展厅名称}小环境湿度最小值}%~{{展厅名称}小环境湿度最大值}%，最小值出现在{{展厅名称}小环境湿度最小值环境}，最大值出现在{{展厅名称}小环境湿度最大值环境}，各监测点湿度{{展厅名称}小环境湿度描述}。');
        }
        if (!empty($this->contents[$hall_name . '微环境湿度'])) {
            $this->_addP('{展厅名称}微环境湿度范围为{{展厅名称}微环境湿度最小值}%~{{展厅名称}微环境湿度最大值}%，最小值出现在{{展厅名称}微环境湿度最小值环境}，最大值出现在{{展厅名称}微环境湿度最大值环境}，各监测点湿度{{展厅名称}微环境湿度描述}。');
        }

        $this->_addP('下面是{展厅名称}全部数据的描述性统计量表格：');
        $this->_addTableDesc('{展厅名称}湿度数据描述性统计量');
        $this->_addP('上表可以看出{{展厅名称}湿度标准差描述}。');
        $this->_addP('为统观{展厅名称}的数据情况，做出了各个监测点的均峰图及标准差条形图。');
        $this->_addImage('{展厅名称}湿度均峰图');
        $this->_addImage('{展厅名称}湿度标准差条形图');
        $this->_addP('日波动同样是观察每个监测点稳定与否的指标之一，因此计算出了每个监测点{报告名称}每天的波动值及其标准差，即{报告名称}全部的日波动值及日标准差，并作出了均峰图。');
        $this->_addImage('{展厅名称}湿度日波动均峰图');
        $this->_addImage('{展厅名称}湿度标准差均峰图');

        $this->_addTableStdDay('{展厅名称}湿度日波动及标准差统计表');
        $this->_addP('通过以上图表可以看出该环境{{展厅名称}湿度日波动描述}，下表为极值相应的日期。');
        $this->_addTableStdDate('{展厅名称}湿度日波动、标准差极值发生的日期列表');
        $this->_addP('从表中可以看出，{{展厅名称}湿度稳定性较差日期}的湿度数据稳定性表现较差，{{展厅名称}湿度稳定性较好日期}稳定性较好。');
        $this->_addP('为探究日波动与日期之间的关系，下面计算出该环境每天所有监测点波动范围（即该监测点当日数据极大值-当日数据极小值）的整体平均值，做出日历图，如下：');
        $this->_addImage('{展厅名称}湿度日波动日历图');

    }

    /**
     * 展厅光照
     * @param $env_no
     * @param int $index
     */
    function _hall_light($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];

        if (empty($this->contents[$hall_name . '光照设备'])) {
            return;
        }

        $this->section->addTitle('光照', $index);
        $equips = json_decode($this->contents[$hall_name . '光照设备']);
        //$equips = explode(',', $this->contents[$hall_name . '光照设备']);
       if($equips){
           foreach ($equips as $equip_no=>$env_name) {
               if (empty($this->images[$hall_name . $env_name .  '('.$equip_no.')' . '光照曲线图'])) {
                   continue;
               }
               $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . '光照曲线图');
               $this->_addP('由图可以看出'.$env_name .  '('.$equip_no.')' . '监测点光照最大值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '光照最大值} lx，最小值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '光照最小值} lx，均值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '光照均值} lx。');
           }
       }
        $this->_addP('整体{{展厅名称}光照描述}。');

    }


    /**
     * 展厅紫外
     * @param $env_no
     * @param int $index
     */
    function _hall_uv($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];

        if (empty($this->contents[$hall_name . '紫外设备'])) {
            return;
        }

        $this->section->addTitle('紫外', $index);

        $equips = json_decode($this->contents[$hall_name . '紫外设备']);
//        $equips = explode(',', $this->contents[$hall_name . '紫外设备']);

       if($equips){
           foreach ($equips as $equip_no=>$env_name) {
               if (empty($this->images[$hall_name .$env_name .  '('.$equip_no.')' . '紫外曲线图'])) {
                   continue;
               }
               $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . '紫外曲线图');
               $this->_addP('上图为{展厅名称}的紫外数据，由图可以看出'.$env_name .  '('.$equip_no.')' . '监测点紫外最大值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '紫外最大值}μw/cm2，最小值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '紫外最小值}μw/cm2，均值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . '紫外均值}μw/cm2。');

           }
       }
        $this->_addP('整体{{展厅名称}紫外描述}。');

    }


    /**
     * 展厅co2
     * @param $env_no
     * @param int $index
     */
    function _hall_co2($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];

        if (empty($this->contents[$hall_name . 'CO2设备'])) {
            return;
        }

        $this->section->addTitle('CO2', $index);

//        $equips = explode(',', $this->contents[$hall_name . 'CO2设备']);
        $equips = json_decode($this->contents[$hall_name . 'CO2设备']);

        if($equips){
            foreach ($equips as $equip_no=>$env_name) {
                if (empty($this->images[$hall_name . $env_name .  '('.$equip_no.')' . 'CO2曲线图'])) {
                    continue;
                }
                $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . 'CO2曲线图');
                $this->_addP('该展厅' .  '('.$equip_no.')' . '监测点CO2浓度在{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'CO2最小值}ppm~{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'CO2最大值} ppm之间， {{展厅名称}'.$env_name .  '('.$equip_no.')' . 'CO2阈值范围内的数据占比}的CO2数据低于{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'CO2阈值}ppm。');

            }
        }
        $this->_addP('整体{{展厅名称}CO2描述}。');

    }

    /**
     * 展厅voc
     * @param $env_no
     * @param int $index
     */
    function _hall_voc($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];

        if (empty($this->contents[$hall_name . 'VOC设备'])) {
            return;
        }

        $this->section->addTitle('VOC', $index);

        $this->_addImage('{展厅名称}VOC箱型图');

//        $equips = explode(',', $this->contents[$hall_name . 'VOC设备']);
        $equips = json_decode($this->contents[$hall_name . 'VOC设备']);
        if($equips){
            foreach ($equips as $equip_no=>$env_name) {

                if (empty($this->images[$hall_name .$env_name .  '('.$equip_no.')' . 'VOC曲线图'])) {
                    continue;
                }
                $this->_addImage('{展厅名称}'.$env_name . '('.$equip_no.')' . 'VOC曲线图');
                $this->_addP('{展厅名称}'.$env_name .  '('.$equip_no.')' . '监测点VOC范围为{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'VOC最小值} ppb ~{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'VOC最大值} ppb，均值为{{展厅名称}'.$env_name .  '('.$equip_no.')' . 'VOC均值} ppb。');

            }
        }

        $this->_addP('整体{{展厅名称}VOC状况描述}。');

        $this->_addP('下表为{展厅名称}VOC数据的描述性统计量表格：');
        $this->_addTableDesc('{展厅名称}VOC数据描述性统计量');
    }

    /**
     * 展厅调控设备
     * @param $env_no
     * @param int $index
     */
    function _hall_regulation($env_no, $index = 5)
    {
        $hall_name = $this->contents['展厅名称'];

        if (empty($this->contents[$hall_name . '调控设备'])) {
            return;
        }

//        $equips = explode(',', $this->contents[$hall_name . '调控设备']);
        $equips =json_decode($this->contents[$hall_name . '调控设备']);

        $this->section->addTitle('调控设备', $index);
        $this->_addP('{展厅名称}展厅' . count($equips) . '个监测点放置了调控设备。为探究调控设备的调控效果，做了如下分析：');

        if($equips){
            foreach ($equips as $equip_no=>$env_name) {
                if (empty($this->images[$hall_name . $env_name .  '('.$equip_no.')' . '湿度曲线图'])) {
                    continue;
                }
                $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . '湿度曲线图');
                $this->_addP("每日的波动情况是衡量设备稳定性的重要指标之一，下图为该调控监测点的日均峰图，其中当日阴影越窄表示日波动越小，与整体目标值距离越近调控效果越好：");
                $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . '日均峰图');
                $this->_addP("为探究相邻日期之间的变化量，计算出了该监测点的波动指数（当天均值-前一日均值后取该结果的绝对值）并绘制曲线图如下:");
                $this->_addImage('{展厅名称}'.$env_name .  '('.$equip_no.')' . '波动指数');
            }
        }
        $this->_addTableDesc('{展厅名称}湿度调控设备数据描述性统计量',true);
        if(isset($this->contents[$hall_name ."湿度调控目标值"])&&$this->contents[$hall_name ."湿度调控目标值"]){
            $this->_addP('由上表可以看出，该环境各监测点湿度均值与目标值的距离为{{展厅名称}调控设备均值与目标值距离最小值}%~{{展厅名称}调控设备均值与目标值距离最大值}%之间。');
        }
    }


    function _replace($text = '')
    {
        $text = str_replace('{展厅名称}', $this->contents['展厅名称'], $text);
        $count = preg_match_all('/{(.*)}/ieU', $text, $matches);
        if ($count > 0) {
            foreach ($matches[1] as $varName) {
                if (isset($this->contents[$varName])) {
                    $text = str_replace('{' . $varName . '}', $this->contents[$varName], $text);
                }
            }
        }
        return $text;
    }

    function _addImage($key, $width = 450)
    {
        $key = str_replace('{展厅名称}', $this->contents['展厅名称'], $key);
        if (!empty($this->images[$key])) {
            $file = $_SERVER["DOCUMENT_ROOT"] . $this->images[$key];
            if (file_exists($file)) {
                $this->section->addImage($file, array('width' => $width));
                $this->_addPCenter('图2-' . $this->image_index++ . ' ' . $key);
            }
        }
    }

    function _addP($text, $font = null)
    {
        $this->section->addText($this->_replace($text), $font, $this->firstLine);
    }

    function _addPCenter($text, $font = null)
    {
        $this->section->addText($this->_replace($text), $font, $this->alignCenter);
    }

    function _addTableDesc($key,$is_regulation = false)
    {
        $key = str_replace('{展厅名称}', $this->contents['展厅名称'], $key);
        $hall_name = $this->contents['展厅名称'];

        if (!isset($this->tableDescs[$key]) || count($this->tableDescs[$key]) == 0) {
            return;
        }
        $this->_addPCenter('表 2-' . $this->table_index++ . ' ' . $key);

        $section = $this->section;

        $table = $section->addTable('table');

        $table->addRow();
        $table->addCell(3000, $this->th_style)->addText('', $this->font5_bold, $this->alignCenter);
        $table->addCell(1200, $this->th_style)->addText('N(数据量)', $this->font5_bold, $this->alignCenter);
        $table->addCell(1000, $this->th_style)->addText('全距', $this->font5_bold, $this->alignCenter);
        $table->addCell(1100, $this->th_style)->addText('极小值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1100, $this->th_style)->addText('极大值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1000, $this->th_style)->addText('均值', $this->font5_bold, $this->alignCenter);
        if($is_regulation&&isset($this->contents[$hall_name ."湿度调控目标值"])&&$this->contents[$hall_name ."湿度调控目标值"]){
            $table->addCell(1000, $this->th_style)->addText('目标值', $this->font5_bold, $this->alignCenter);
        }
        $table->addCell(1100, $this->th_style)->addText('标准差', $this->font5_bold, $this->alignCenter);

        foreach ($this->tableDescs[$key] as $row) {
            $table->addRow();
            $table->addCell(3000, $this->td_style)->addText($row['env_name'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['total_count'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['range'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['min'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['max'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['avg'], $this->font5, $this->alignCenter);
            if($is_regulation&&isset($this->contents[$hall_name ."湿度调控目标值"])&&$this->contents[$hall_name ."湿度调控目标值"]){
                $table->addCell(1000, $this->th_style)->addText($row['target'], $this->font5, $this->alignCenter);
            }
            $table->addCell(1000, $this->td_style)->addText($row['std'], $this->font5, $this->alignCenter);
        }
    }

    function _addTableStdDay($key)
    {
        $key = str_replace('{展厅名称}', $this->contents['展厅名称'], $key);
        if (!isset($this->tableStdDays[$key]) || count($this->tableStdDays[$key]) == 0) {
            return;
        }
        $this->_addPCenter('表 2-' . $this->table_index++ . ' ' . $key);

        $section = $this->section;

        $table = $section->addTable('table');

        $table->addRow();
        $table->addCell(1800, $this->th_style)->addText('', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('日波动最大值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('日波动最小值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1500, $this->th_style)->addText('日波动均值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('标准差最大值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('标准差最小值', $this->font5_bold, $this->alignCenter);
        $table->addCell(1500, $this->th_style)->addText('标准差均值', $this->font5_bold, $this->alignCenter);

        foreach ($this->tableStdDays[$key] as $row) {
            $table->addRow();
            $table->addCell(1500, $this->td_style)->addText($row['env_name'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['range_max'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['range_min'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['range_avg'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['std_max'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['std_min'], $this->font5, $this->alignCenter);
            $table->addCell(1500, $this->td_style)->addText($row['std_avg'], $this->font5, $this->alignCenter);
        }
    }

    function _addTableStdDate($key)
    {
        $key = str_replace('{展厅名称}', $this->contents['展厅名称'], $key);
        if (!isset($this->tableStdDates[$key]) || count($this->tableStdDates[$key]) == 0) {
            return;
        }
        $this->_addPCenter('表 2-' . $this->table_index++ . ' ' . $key);

        $section = $this->section;

        $table = $section->addTable('table');

        $table->addRow();
        $table->addCell(1800, $this->th_style)->addText('', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('日波动最大日期', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('日波动最小日期', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('标准差最大日期', $this->font5_bold, $this->alignCenter);
        $table->addCell(1800, $this->th_style)->addText('标准差最小日期', $this->font5_bold, $this->alignCenter);

        foreach ($this->tableStdDates[$key] as $row) {
            $table->addRow();
            $table->addCell(1000, $this->td_style)->addText($row['env_name'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['range_max_date'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['range_min_date'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['std_max_date'], $this->font5, $this->alignCenter);
            $table->addCell(1000, $this->td_style)->addText($row['std_min_date'], $this->font5, $this->alignCenter);
        }
    }

}