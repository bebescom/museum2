<?php
require_once dirname(__FILE__) . "/phpword/autoload.php";

/**
 * Class \PhpOffice\PhpWord 操作word
 */
class Phpword
{
    var $phpWord;

    /**
     * @return array
     */
    function generate()
    {
        $phpWord = new \PhpOffice\PhpWord\PhpWord();

        $phpWord->setDefaultFontName('仿宋'); // 全局字体
        $phpWord->setDefaultFontSize(14);     // 全局字号

        $phpWord->setDefaultParagraphStyle(
            array(
                'align' => 'both',
                'lineHeight' => 1.5,  // 行间距
            )
        );
        $phpWord->addNumberingStyle(
            'hNum',
            array('type' => 'multilevel', 'levels' => array(
                array('pStyle' => 'Heading1', 'format' => 'decimal', 'text' => '%1'),
                array('pStyle' => 'Heading2', 'format' => 'decimal', 'text' => '%1.%2'),
                array('pStyle' => 'Heading3', 'format' => 'decimal', 'text' => '%1.%2.%3'),
                array('pStyle' => 'Heading4', 'format' => 'decimal', 'text' => '%1.%2.%3.%4'),
                array('pStyle' => 'Heading5', 'format' => 'decimal', 'text' => '%1.%2.%3.%4.%5'),
                array('pStyle' => 'Heading6', 'format' => 'decimal', 'text' => '%1.%2.%3.%4.%5.%6'),
            )
            )
        );

        $phpWord->addTitleStyle(1, array('size' => 24, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 0));
        $phpWord->addTitleStyle(2, array('size' => 22, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 1));
        $phpWord->addTitleStyle(3, array('size' => 18, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 2));
        $phpWord->addTitleStyle(4, array('size' => 16, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 3));
        $phpWord->addTitleStyle(5, array('size' => 15, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 4));
        $phpWord->addTitleStyle(6, array('size' => 14, 'bold' => true, 'name' => '黑体'), array('numStyle' => 'hNum', 'numLevel' => 5));

        $styleTable = array('borderTopSize' => 6, 'borderBottomSize' => 6, 'borderColor' => '000', 'width' => '100%', 'cellMargin' => 60);
        $phpWord->addTableStyle('table', $styleTable);

        $section = $phpWord->addSection();

        $this->phpWord = $phpWord;

        return array($phpWord, $section);

    }

    function save($filepath)
    {
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($this->phpWord, 'Word2007');
        $objWriter->save($filepath);

    }

}

