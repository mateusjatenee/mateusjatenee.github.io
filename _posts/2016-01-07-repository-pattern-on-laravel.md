---
layout: post
title: "Repository Pattern on Laravel"
date: 2016-01-07 04:18:00
image: '/assets/img/blog-image.png'
description:
tags:
- php
- laravel
- patterns
categories:
- php
- laravel
twitter_text:
---

Let's say you have a model called Post. It retrieve data from the ```Posts``` table and you use it in many methods and it is almost in the whole application. For now, it retrieves posts by it's ID, but your boss told you he wants it to retrieve by the post's name (slug). Now, there are two possibilities: your application is not big enough and you can just find and replace every ```Post::find($id)``` with something like ```Post::where('slug', $slug)->get()```. Perfect, everything works fine!  
But what if your app is so big it will just take too much time/stress/whatever to change everything, you're retrieving the post by it's ID everywhere. What If we could create a layer between the business model and the data storing layer - in this case, our controller methods and the database? It would be nice, wouldn't it? It would avoid - between other things - duplicated code, testing, uncentralized code, etc. That's kind of what the repository pattern is about. 

Let's say you want to show a post. You'd usually do something like this:
{% highlight php %}
<?php
// app/Http/Controllers/PostsController.php

public method show($id) {
	$post = Post::find($id);
	return $post;
	// or return a view, whatever.
}
?>
{% endhighlight %}

So, it wouldn't be very easy to mantain this code if things get big. With the Repository Pattern, you could do something like this:

{% highlight php %}
// app/Repositories/PostRepository.php

<?php

namespace App\Repositories;

use App\Post;

class PostRepository
{

	protected $post;

	public function __construct(Post $post)
	{
	    $this->post = $post;
	}

	public function find($id)
	{
		return $this->post->find($id);
	}

	public function findBy($att, $column)
	{
		return $this->post->where($att, $column)->get();
	}
}

?>
{% endhighlight %}

So, basically, we created a layer and gave it - obviously - a namespace. We created methods to help us retrieve the posts and leave it all in one place. Even better, we could make the class implement an interface, but I'm going to leave this for another post.

Now, we made two methods that allow us to do a lot of things. We can find a post by it's id, it's slug, date, name, title, or anything with just two methods. We would need a lot of distributed, different methods through the app to do this. So, now, we just need to use those methods in the ```PostsController```.

{% highlight php %}
<?php

namespace App\Http\Controllers;

use App\Repositories\PostRepository;

class PostsController
{
	protected $post;

	public function __construct(PostRepository $post)
	{
		$this->post = $post;
	}

	public function show($slug)
	{
		return $this->post->findBy('slug', $slug);
	}
}
?>

{% endhighlight %}

So, take a look at what we did - first, we made the $post variable protected. Then, we injected the PostRepository dependecy in the constructor (thanks Laravel IoC) and then we just used a function from PostRepository. Now we can use one method in multiple places and change how it behaves at multiplace places on just one place - your code is "centralized", you know where everything is and it's way easier to mantain. 

I hope this tutorial helped, not really at writing them. Sorry for any mistakes I made in the tutorial.