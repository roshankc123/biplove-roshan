<?php
error_reporting(0);
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
        $conn=mysqli_connect("127.0.0.1","root","","tree");
        if(!$conn){ die(mysqli_connect_error());}
        $user=str_replace(array("'","-"),array("&qot","&das"),$_GET['user']);
      }
      
    
      if($_GET['clone'] && $_POST['key']){
        $clone_key=str_replace(array("'","-"),"",$_POST['key']);
      }
      else{
        $clone_key="";
      }
      if($_POST['json_file']){
        $key=hash("md5",$_POST['key'].$user.time());
        $json_file_filter=str_replace(array("'","-"),array("&qot","&das"),$_POST['json_file']);
        $qry=mysqli_query($conn,"insert into data values('0',
                                    '".$user."',
                                    '".$json_file_filter."',
                                    1,
                                    '".$key."');");
        if(!$qry){ echo mysqli_error($conn);die("error"); }
        else{ echo $key; }
      }

      if($_GET['get_json']==1 || $_GET['clone']==1){
        if($_GET['get_json']){
          $qry=mysqli_query($conn,"select u_json from data 
                                    where def=1 and u_cookie='".$user."' order by sn desc limit 1");
        }
        else{
          $qry=mysqli_query($conn,"select u_json from data 
                                    where u_key='".$clone_key."' order by sn desc limit 1");
        }
        if(!$qry){echo mysqli_error($conn);}
        $data=mysqli_fetch_all($qry);
        $json_file_filter=str_replace(array("&qot","&das"),array("'","-"),$data[0][0]);
        echo $json_file_filter;
      }


      if($_GET['delete']==1){
        $qry=mysqli_query($conn,"update data set def=0 where u_cookie='".$user."';");
        if(!$qry){echo mysqli_error($conn);}
        else{ echo $user." deleted"; }
      }

  ///tree name and created time ,,tree name is it's main parent name
?>
