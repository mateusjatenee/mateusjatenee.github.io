---
layout: post
title: "Binary search demystified"
date: 2016-03-09 19:15:57
image: '/assets/img/posts/binary-search-demystified.png'
description: "Simple explanation of how a binary search works"
tags:
- programming
- algorithms
- binary search
categories:
- algorithms
twitter_text:
---

In this post I'll show how straightforward a binary search is.  

A binary search is nothing more than an algorithm that finds a value in an array. A **sorted** array. If the array is **not sorted**, then it may even be better to just linear search it. It executes in **O(log n)**. If you're not familiar with this notation, take a look at [Big-O Notation](https://en.wikipedia.org/wiki/Big_O_notation) and [Time Complexity](https://en.wikipedia.org/wiki/Time_complexity).    

Let's say you have the following array: `[1, 3, 9, 14, 15, 19, 44, 51]`. You want to find the index of the number `15` and you instantly get a solution! just iterate through the array and check if the index value equals the one you wanted. So you'd write something like this in Javascript:  

```javascript
function linearSearch(array, number) {

	for(var i = 0; i < array.length; i++) {
		if(array[i] === number) {
			return i;
		}
	}

	return -1;

}

var array = [1, 3, 9, 14, 15, 19, 44, 51];
console.log(linearSearch(array, 15));
```  

It's fairly simple: first, we declare our function that accepts two arguments: the array itself and the value we want to find.  

Then, we start to iterate through the array using a `for` loop and then we check if the value of the index we're at equals the value we want to find — if it does, we return the index number (remember: in most languages, the first index of an array is **0**, not 1). If the loop runs and nothing is found, it returns -1.  

Then we just create a variable with our array and call our function. If you run this, you'll get **4** — that's because the value **15** is `array[4]`.   

Now, you probably noticed this algorithm isn't much effecient when working with a large array, right? it will iterate from the beggining until it finds a value, and if the value doesn't exist in the array, it will have to iterate through the entire array.  That's when binary search is useful.  

## Binary Search  

Binary search works in a different way than a linear search. Instead of iterating through the entire array, it "guesses" indexes and compares them to the value we want. So, let's say we have a large array, composed of 20001 random numbers, ordered. Instead of beggining the search in the first index, we try to start at the half of the array, at index 10000. Then, we check if the value we got at this index equals the value we want. If it does, we return it. If it doesn't, we check if it is higher than the value we want — if it is, it means that everything to the "right" of the array can be discarded. If the `array[10000]` is higher than the number we want, it means everything from `array[10000]` to `array[20000]` can be trashed. Then, we'll check the "half" of our array again — now `array[5000]`and do what we did before. The intervals are getting smaller and smaller and it'll be much quickier to find our value.  

We can do it like this:  

```javascript
function binarySearch(array, n) {
	var min = 0;
	var max = array.length - 1;
	var avg;

	while(min <= max) {
		avg = parseInt((max + min) / 2);

		if(array[avg] === n) {
			return avg;
		}
		else if(array[avg] < n) {
			min = avg + 1;
		} else {
			max = avg - 1;
		}
	}

	return -1;
}

var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

console.log(binarySearch(primes, 97));
```

Take a look at it. This is actually my solution to one of Codility`s exercises if I'm not mistaken. Whatever.  

We start by declaring our function that — just like linear search — accepts two arguments. The first one being the array itself and the second one being the value we want to find.  

Then, we start to declare our variables. Min being, well, the minimum being 0 just like the first index of the array, and the max being the last index of the array. Remember, an array starts at index `0`, thats why we subtract `1` from the array's length.  

Then we declare our `avg` variable because we're going to use it.  

In the `while` loop is where things get "tricky". First, we stablish the condition that the loop will run until `min` is less or equals to `max`. We do that because as I said before we'll be eliminating half of the array each loop.  Then, we declare our `avg` variable — it is the average of the `max` and `minimum`. I used `parseInt` so I wouldn't get any decimals (an `int`) but IIRC `Math.floor` is faster. Now that we got our `average`, it is time to test our possibilities and decide what to do. First, we see if the index we're at value is the number we want — if it is, perfect! let's just return it. If it is not, there are two possibilites:  

* The index we're at value is less than the one we want. If that's true, any index below we're at can be discarded. So, we declare that min equals `avg + 1`. We just removed half of the elements because we increased the `min` value and the `while` condition is closer to be true. 
* The index we're at value is bigger than the one we want. If that's true, any index above the one we're at can be discarded. So, we declare that `max` is `avg - 1`, therefore removing half of the elements.   


And this will repeat until we find our number or `max` equals `min`. If the latter happens and no value is found, that means our value is not in the array and we return `-1`. Pretty simple, right? :)
