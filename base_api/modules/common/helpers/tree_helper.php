<?php

/**
 * 生成tree {id:id,fid:fid,children:{}}
 * @param $items
 * @param array $option
 * @return array
 */
function generate_tree($items, $option = array(),$inc_self=false)
{
    $option = array_merge(array('id' => 'id', 'fid' => 'fid', 'children' => 'children', 'root' => ''), $option);
    $tree = array(); //格式化的树
    $tmpMap = array(); //临时扁平数据
    $parent_env_no = array();//包含子环境的环境

    foreach ($items as $item) {
        $tmpMap[$item[$option['id']]] = $item;
        if(isset($item['parent_env_no'])&&$item['parent_env_no']&&!in_array($item['parent_env_no'],$parent_env_no)){
            $parent_env_no[] = $item['parent_env_no'];
        }
    }

    foreach ($items as $item) {
        $item['name'] .= "直属";
        if (isset($tmpMap[$item[$option['fid']]])) {
            $tmpMap[$item[$option['fid']]][$option['children']][] = &$tmpMap[$item[$option['id']]];
        } else {
            $tree[] = &$tmpMap[$item[$option['id']]];
        }

        if($inc_self){
            if(in_array($item[$option['id']],$parent_env_no)){
                if(!isset($tmpMap[$item[$option['id']]][$option['children']])){
                    $tmpMap[$item[$option['id']]][$option['children']] = array();
                }
                array_unshift($tmpMap[$item[$option['id']]][$option['children']],$item);
            }
        }
    }
    if ($option['root'] != '') {
        return $tmpMap[$option['root']];
    }

    unset($tmpMap);
    return $tree;
}
