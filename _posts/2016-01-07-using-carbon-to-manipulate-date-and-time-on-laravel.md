---
layout: post
title: "Using Carbon to manipulate date and time on Laravel"
date: 2016-01-07 04:08:47
image: '/assets/img/'
description: How to use a TimeDate API
tags:
- web
- php
- laravel
- carbon
categories:
- php
- laravel 
twitter_text:
---

Laravel comes with some awesome stuff, including [Carbon](https://github.com/briannesbitt/Carbon) -- a PHP API Extension for DateTime -- out-of-the-box. It can be used to easily manipulate dates. For instance, if you have ```1995-01-30```, which is Y-m-d format, you can easily mutate it to ```30/01/1995```using Carbon. It is as simple as the following:  
{% highlight php %}
Use Carbon\Carbon;

// First, we need to make sure it is a Carbon instance. So let's create a variable that'll store a date
$date = Carbon::create(1995, 01, 30); // now we have 1995-01-30.
// Now, let's mutate it to a format. First, i'll echo a Y-m-d format.
echo $date->format('Y-m-d');
// Now, let's echo it in d/m/Y format
echo $date->format('d/m/Y');

// We can also use Difference For Humans - it basically allows you to say "1 month ago" instead of the actual date. So, today is October 6th. I can either show the user 2015-10-04 (Y-m-d format) or I can show "2 days ago", which is way better and possible with Difference for Humans. Let's do it.
echo $date->diffForHumans; // 10 years ago. 
{% endhighlight %}

Laravel allows we to retrieve stuff from the database directly as a Carbon instance. It has, by default, created_at and modified_at as Carbon instances. We can add new fields by creating an array ```php $dates ``` with the fields. If I want to retrieve everything from the ```day``` field as a Carbon instance, I just have to put in on the array.  
{% highlight php %}
class Post extends Model
{

    protected $dates = ['day'];
...
{% endhighlight %}


Carbon has many other features and you can check them all [here](https://github.com/briannesbitt/Carbon). :)
