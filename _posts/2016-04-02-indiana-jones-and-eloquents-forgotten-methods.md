---
layout: post
title: "Indiana Jones and Eloquent's Forgotten Methods"
date: 2016-04-02 23:12:29
image: '/assets/img/'
description:
tags:
categories:
- laravel
- php
- eloquent
twitter_text:
---

There are some well-known Eloquent methods that everyone uses: `find`, `findOrFail`, `create`, etc. What many people don't know is that there are so many more methods we don't usually use. I'll talk about some of them here and how they can help you.  

For better understanding, we're going to work with a imaginary table called `posts` that has the following columns: `INT id`, `VARCHAR title`, `TEXT content` and the usual `created_at` and `updated_at`. I made a GitHub Repo so you can see the code. I also created a database seeder so we have 100 records to work with.

## findMany  

There is the famous `find`, but there is also his brother `findMany`. While `find` finds one specific record through it's primary key (usually `id`), it's brother — as you've probably imagined — finds many records through their primary keys. It accepts an array of IDs as the first and only parameter. Let's say we want posts `1`, `2` and `3`. That's how we're going to do it:  

```php
<?php

public function getFirstSecondAndThirdPosts()
{
	$posts = Post::findMany(['1', '2', '3']);
	return $posts;
}
?>
```

```json
[
{
id: 1,
title: "Velit velit fuga fugiat repudiandae tempore.",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
},
{
id: 2,
title: "Eius facere quo est cupiditate.",
content: "Voluptatem recusandae molestiae sint. Ut at ut earum omnis sit totam. Sint hic voluptate autem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
},
{
id: 3,
title: "Omnis sed delectus qui nemo atque.",
content: "Esse earum velit sed sapiente. Necessitatibus id esse alias nemo est repellendus sapiente. Pariatur sunt distinctio totam culpa similique. Rem sed quo doloremque debitis voluptatibus neque.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
}
]
```

So yeah, that's how you can find multiple records through their IDs. :)    

## firstOrCreate  

This one is pretty cool. You pass an array of attributes and Eloquent tries to find a record that matches it, If it doesn't, it creates one. So, in the previous example we got the first three records. First, let's try to find one record that has the first record attributes:  

```php
<?php

public function example2()
{
    // firstOrCreate
    $posts = Post::firstOrCreate([
        'title' => 'Velit velit fuga fugiat repudiandae tempore.',
        'content' => 'Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.',
    ]);

    return $posts;
}

?>
```

And that's what we get back:  

```json
{
id: 1,
title: "Velit velit fuga fugiat repudiandae tempore.",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:42:52"
}
```

It returned us the first record because It did find a record that matched what we wanted. However, If we tried the following code:  

```php 

<?php 

public function example2()
{
    // firstOrCreate
    $posts = Post::firstOrCreate([
        'title' => 'Velit velit fuga fugiat repudiandae tempore.',
        'content' => 'Whatever',
    ]);

    return $posts;
}

?>

``` 

It would return us this:  

```json
{
title: "This one doesnt exist",
content: "Whatever",
created_at: "2016-04-03 02:48:00",
updated_at: "2016-04-03 02:48:00",
id: 101
}
```

As you can see by the ID, we created this record. That's because we couldn't find any record that matched our attributes.  

## each  

Each is a simple method that executes a callback over each item while chunking. So, if we wanted to change the title of all the records from 1 to 3, we could have done the following:

```php
<?php

public function example3()
{
    $posts = Post::find(['1', '2', '3'])->each(function ($item, $key) {
        $item->update(['title' => 'Whatever']);
    });

    return $posts;
}

?>  

And that's what it returns:   
```json
[
{
id: 1,
title: "Whatever",
content: "Est vel sapiente assumenda consectetur. Iusto corporis laudantium aspernatur hic quo iure corrupti. Eaque alias quos maiores perferendis. Dolor veniam distinctio mollitia exercitationem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
},
{
id: 2,
title: "Whatever",
content: "Voluptatem recusandae molestiae sint. Ut at ut earum omnis sit totam. Sint hic voluptate autem.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
},
{
id: 3,
title: "Whatever",
content: "Esse earum velit sed sapiente. Necessitatibus id esse alias nemo est repellendus sapiente. Pariatur sunt distinctio totam culpa similique. Rem sed quo doloremque debitis voluptatibus neque.",
created_at: "2016-04-03 02:42:52",
updated_at: "2016-04-03 02:59:10"
}
]
```

That's all by now folks. I'll come back with more later. Thanks! :)