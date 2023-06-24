
<?php

// going to use above code
require 'database.php';
  
// printing column name above the data
echo 'ID'.' '.'First Name'.' '.'Last Name'.' '.'username'.'<br>';

// mysql_query will execute the query to fetch data
if ($result = $mysqli -> query("SELECT * FROM user_info"))
{

    foreach($result as $row) 
    {
        foreach($row as $i) 
        {
            echo $i;
        }
    }

    // loop will iterate until all data is fetched

    /*
    while ($query_executed = mysqli_fetch_assoc ($is_query_run))
    {
        // these four line is for four column
        echo $query_executed['Id'].' ';
        echo $query_executed['first_name'].' ';
        echo $query_executed['last_name'].' ';
        echo $query_executed['username'].'<br>';
    }
    */
    
    echo "Returned rows are: " . $result -> num_rows;
}
else
{
    echo "Error in execution!";
}

?>