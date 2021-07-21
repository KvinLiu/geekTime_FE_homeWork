function ListNode(val) {
	this.val = val;
	this.next = null;
}

// 1. 反转链表
var reverseList = function (head) {
	let prev = null, cur = head, next = null;
	while (cur != null) {
		next = cur.next;
		cur.next = prev;
		prev = cur;
		cur = next;
	}
	return prev;
}
const one = new ListNode(1)
const two = new ListNode(2)
const three = new ListNode(3)

one.next = two 
two.next = three
console.log("Normal: ", one);
console.log("Reversed: ", reverseList(one));

// 2. 数组中第 K 大的元素
let findKthLargest = (arr, k) => {
    let n = arr.length;
    arr.sort((a, b) => a - b);
    return arr[n - k];
};

const ranArr = [1,3,5,6,8,0];
console.log(findKthLargest(ranArr, 2) === 6);