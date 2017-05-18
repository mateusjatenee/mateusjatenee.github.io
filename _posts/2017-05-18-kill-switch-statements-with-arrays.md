---
layout: post
title: "Kill switch statements with arrays"
date: 2017-05-18 16:23:00
image: '/assets/img/posts/cleaning-up-switch-statements.png'
description: "Cleaning up switch statements with lookup tables"
tags:
- php
- laravel
- clean
categories:
- php
- laravel
twitter_text:
---


I remember of some code I had to work on and it contained a switch statement like the one below

```php   
function get_state($state)
{
    switch ($state) {
        case 'CA':
            $state = 'California';
        case 'CO':
            $state = 'Colorado';
        case 'TX':
            $state = 'Texas';
        default:
            $state = 'Texas';
    }

    return $state;
}
```   

What it does is pretty simple - just get the state initials and return it's full name. However, there are two lines of code for each state, plus it is very verbose. For 48 states there would be **at least** 96 lines. We can clean this up very quickly with a lookup table. Instead of writing dozens of cases for the switch statement, let's define an array with the initials as the keys and the full names as the values. Something like `initials => fullName`.  

```php  
function get_state($state)
{
	$states = [
		'CA' => 'California',
		'CO' => 'Colorado',
		'TX' => 'Texas'
	];

	return $states[$state] ?? $states['TX'];
}
```

It's a pretty simple tip but also very helpful. Instead of writing huge switch statements, just build an array and try to find it through the indexes. If it's not found, just return a default value [(using the null coalescing operator)](http://php.net/manual/en/migration70.new-features.php#migration70.new-features.null-coalesce-op).    

Hope to have helped! :)
