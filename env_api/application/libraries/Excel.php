<?php
require_once dirname(__FILE__)."/PHPExcel.php";
/**
* 导出数据类
*/
class Excel{
    // 下载 excel2007
    function download2007($filename, $fields, $data,$save_dir="",$column_size=array())
    {
        array_unshift($data, $fields);
        foreach ($fields as $key => $value) {
            $fields[$key] = '';
        }
        if(!$save_dir){
            $save_dir = 'downloads/';
        }
        if(!is_dir($save_dir)){
            mkdir('downloads/');
        }
        if(file_exists($save_dir.$filename)){
            unlink($save_dir.$filename);
        }

        // 生成excel
        $objPHPExcel = new PHPExcel();
//        if($column_size){
//            foreach($column_size as $column=>$size){
//                $objPHPExcel->getActiveSheet()->getColumnDimension($column)->setWidth($size);
//            }
//        }

        foreach ($data as $k => $d) {
            $d = array_values(array_merge($fields, $d)); // 补全字段 取值
            $column_names = array_keys($fields);
            $key = ord("A");//65
            $key2 = ord("@");//64
            foreach ($d as $i=>$v) {
                //列数重排A1,..,Z1 >> AA1,..,AZ1 >> BA1,...,BZ1
                $column_first = $key2 + floor($i/26);//第一位编号的编码序号
                $column_second = $key + $i % 26;//第二位编号的编码序号
                if($i >= 26){//列大于26
                    $c = chr($column_first).chr($column_second);
                }else{
                    $c = chr($column_second);
                }
               if(isset($column_names[$i])&&$column_names[$i]){
                   if(in_array($column_names[$i],array_keys($column_size))){
                       $objPHPExcel->getActiveSheet()->getColumnDimension($c)->setWidth($column_size[$column_names[$i]]);
                   }else{
                       $objPHPExcel->getActiveSheet()->getColumnDimension($c)->setWidth(22);
                   }
               }
                if(isset($column_names[$i])&&$column_names[$i] != "image"){
                    $objPHPExcel->getActiveSheet()->setCellValue($c.($k+1), $v);
                }else{
                    if($v){
                        if($k != 0){
                            $objPHPExcel->getActiveSheet()->getRowDimension($k+1)->setRowHeight(150);
                        }
                        $image_path = $_SERVER['DOCUMENT_ROOT'].$v;
                        if(file_exists($image_path)){
                            /*实例化插入图片类*/
                            $objDrawing = new PHPExcel_Worksheet_Drawing();
                            /*设置图片路径 切记：只能是本地图片*/
                            $objDrawing->setPath($image_path);
                            /*设置图片高度*/
                            $objDrawing->setHeight(150);
                            $objDrawing->setWidth(150);
                            /*设置图片要插入的单元格*/
                            $objDrawing->setCoordinates($c.($k+1));
                            $objDrawing->setWorksheet($objPHPExcel->getActiveSheet());
                        }else{
                            $objPHPExcel->getActiveSheet()->setCellValue($c.($k+1), $v);
                        }
                    }
                }
            }
        }
        $objWriter = new PHPExcel_Writer_Excel2007($objPHPExcel);
        try{
            $os_name = PHP_OS;
            if(strpos($os_name,"WIN")!==false){
                $filename = mb_convert_encoding($filename,"gbk","utf-8");
            }
            $url = $save_dir.$filename.'.xlsx';
            if(file_exists($url)){
                unlink($url);
            }
            $url = judgeRename($url);   // 判断文件重名
            $objWriter->save($url);

            if(strpos($os_name,"WIN")!==false){
                $url = mb_convert_encoding($url,"utf-8","gbk");
            }
            return  $url;
        }catch (Exception $exception){
            return $exception;
        }
    }


    /**
    *读取excel文件内容
     */
    function readExcel($filename,$encode='utf-8',$image_path='./upload_file')
    {
//        $objReader = PHPExcel_IOFactory::createReader('Excel2007');
//        $objReader->setReadDataOnly(true);
        $filetype = PHPExcel_IOFactory::identify($filename);
        $objPHPExcel = PHPExcel_IOFactory::load($filename);
        $objWorksheet = $objPHPExcel->getActiveSheet();
        $highestRow = $objWorksheet->getHighestRow();
        $highestColumn = $objWorksheet->getHighestColumn();
        $highestColumnIndex = PHPExcel_Cell::columnIndexFromString($highestColumn);

        if(!is_dir($image_path)){
            mkdir($image_path);
        }
        //处理图片
        $images = array();
        $drawingCollections = $objWorksheet->getDrawingCollection();
        if($drawingCollections){
            foreach ($drawingCollections as $drawingCollection) {
                $coldata = $drawingCollection->getCoordinates();//获取单元格数据
                list($startColumn, $startRow) = PHPExcel_Cell::coordinateFromString($coldata);//获取列与行号
                $filename = $drawingCollection->getIndexedFilename();  //文件名
                $image_name = $coldata.'_'.$filename;

                switch($filetype){
                    case "Excel5":
                        ob_start();
                        call_user_func(
                            $drawingCollection->getRenderingFunction(),
                            $drawingCollection->getImageResource()
                        );
                        $imageContents = ob_get_contents();
                        file_put_contents($image_path.'/'.$image_name,$imageContents); //把文件保存到本地
                        $images[(int)(substr($coldata,1))] = $image_path.'/'.$image_name;
                        ob_end_clean();
                        break;
                    case "Excel2007":
                        $filepath = $drawingCollection->getPath();//图片地址
                        //把文件保存到本地
                        if(copy($filepath,$image_path.'/'.$image_name)){
                            $images[(int)(substr($coldata,1))] = $image_path.'/'.$image_name;
                        }
                        break;
                }
            }
        }
        $excelData = array();
        $column = array();
        for ($row = 1; $row <= $highestRow; $row++) {
            for ($col = 0; $col < $highestColumnIndex; $col++) {
                if($row == 1){
                    $column[$col] = (string)$objWorksheet->getCellByColumnAndRow($col, $row)->getValue();
                }
                if(isset($column[$col])&&$column[$col] == "图片"){
                    $excelData[$row][$col] = isset($images[$row])&&$images[$row]?$images[$row]:"";
                    if($row == 1){
                        $excelData[$row][$col] = "图片";
                    }
                }else{
                    $excelData[$row][$col] =(string)$objWorksheet->getCellByColumnAndRow($col, $row)->getValue();
                }
            }
        }

        return $excelData;
    }
}

