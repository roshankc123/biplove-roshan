<?php
error_reporting(0);
$conn=mysqli_connect("127.0.0.1","root","","tree");
if(!$conn){ die(mysqli_connect_error());}
header('Access-Control-Allow-Origin: *');
    if($_FILES['u_image']['tmp_name']){
      $image="images/".$_REQUEST['div_id'].".png";
        $fp=fopen($_FILES['u_image']['tmp_name'],'r');
        $fp_w=fopen($image,'w');
        $x=fread($fp,$_FILES['u_image']['size']);
        fwrite($fp_w,$x);
        fclose($fp_w);
        fclose($fp);
        //echo $image."::done";
      }
      if($_GET['user']){
        $user=str_replace(array("'","-"),array("&qot","&das"),$_GET['user']);
      }
      if($_POST['json_file']){
        $json_file_filter=str_replace(array("'","-"),array("&qot","&das"),$_POST['json_file']);
        $qry=mysqli_query($conn,"insert into data values('0',
                                    '".$user."',
                                    '".$json_file_filter."');");
        if(!$qry){ echo mysqli_error($conn); }
      }
      if($_GET['get_json']==1){
        $qry=mysqli_query($conn,"select u_json from data where u_cookie='".$user."' order by sn desc limit 1");
        if(!$qry){echo mysqli_error($conn);}
        $data=mysqli_fetch_all($qry);
        $json_file_filter=str_replace(array("&qot","&das"),array("'","-"),$data[0][0]);
        echo $json_file_filter;
      }
?>