<?php
class Rest_des {

    function encrypt($data,$key) {
        return openssl_encrypt ($data, 'des-ecb', $key);
    }
    function decrypt($data,$key) {
        return openssl_decrypt ($data, 'des-ecb', $key);
    }
}