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