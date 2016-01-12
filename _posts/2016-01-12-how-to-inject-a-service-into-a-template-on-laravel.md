---
layout: post
title: "How to inject a service into a template on Laravel"
date: 2016-01-12 00:40:10
image: '/assets/img/posts/how-to-inject-a-service-into-a-template-on-laravel.png'
description: "This tutorial is all about how to inject a service from the IoC into a view and avoid duplicated code."
tags:
- php
- laravel
- blade
categories:
- php
- laravel
twitter_text:
---

In this tutorial I'm going to explain how to use Laravel 5.1 [`service injection`](https://laravel.com/docs/5.2/blade#service-injection) feature.   
It was very common to have a view (a partial) that was shared between many controllers and that used information stored in the DB or something similar. In this case, the usual choice was to pass this data as a variable to all all views that included this `partial`. Here are some examples:  

Your partial:  

```html
{% raw %}
<div class="sponsors">
	<ul>
		@foreach($sponsors as $sponsor)
			<li>{{ $sponsor->name }}</li>
		@endforeach
	</ul>
</div>
{% endraw %}
```

In this case, we want do display our website sponsors. These sponsors may vary and are all stored in a table and that how we show them. We need to get this variable from somewhere, so we would usually do something like this:

```php
<?php
// app/Http/Controllers/PostController
...

public function show($id)
{
	$post = $this->post->find($id);
	$sponsors = $this->sponsorsService->getAllSponsors();

	return view('post.show', compact('post', 'sponsors'));
}
?>

```

The view `post/show` would have a variable and that pass it to the `sponsors` partial. Then, we would repeat the exact same thing in another controller to use in another view that also includes the sponsors.. and again, and again. Instead of this, we could inject `sponsorsService` directly in the partial. We would do it like this:

```html
{% raw %}
<!-- sponsors partial -->
@inject('sponsors', 'App\Services\Sponsors')
<div class="sponsors">
	<ul>
		@foreach($sponsors as $sponsor)
			<li>{{ $sponsor->name }}</li>
		@endforeach
	</ul>
</div>
{% endraw %}
``` 

Take a look. Instead of passing the variable in every controller, we used `@inject` to easily inject it into the view. It requires two arguments: the first one is the variable `name` and the second one being the class or interface.  
This way, we don't have to worry about sending variables to every view that uses the sponsor list. We injected them directly in the view. :-)


