---
layout: post
title: "Project Euler Problem 1 (English)"
date: 2016-01-07 03:59:48
image: '/assets/img/'
description:
tags:
categories:
twitter_text:
---


I’ll try to solve two or three PE problems per week and post here, along with an explanation of how I reached the result. So, let’s start with… problem 1.

If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23. Find the sum of all the multiples of 3 or 5 below 1000.

OK. So let’s use Python on this one. There are many different ways we could do this – I chose something more “brute”.



Okay. So, what are we doing? First, we tell Python the variable number stores the value of ``` 0 ```. In other words, the variable is there but holds nothing. Then, we say this: while i stays between 1 and 1000, do this – and then we pass a condition. In line 3 – where the condition is passed – there is the modulo operator - it finds the remainder of a division. So, for a number to be multiple of 3 or 5, it needs to have a remainder of 0 when we divide it by 3 or 5, right? That’s what we’re doing. Now that we have passed this condition, we can simply sum i. Remember: this will only happen when i has a remainder of 0 when divided by 3 or 5. After we increment number with i and all the loops have been done, we print number.

There are many other ways we could have done that. Instead of number = number + i, it is possible to simply write number += i. It is also possible to do this with arithmetic progressions.

Okay, that’s it!