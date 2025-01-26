/**
 * 将 Date 转化为指定格式的String
 * 年(YYYY)、月(MM)、日(DD)、时(h)、分(m)、秒(s)、季度(q)、毫秒(S) 
 * 例子：
 * (new Date()).Format("YYYY-MM-DD hh:mm:ss.S") ==> 2024-07-02 08:09:04.423
 * (new Date()).Format("yy-M-d h:m")            ==> 24-7-2 8:9
 */
Date.prototype.Format = function (fmt) {
	let t = {};
  	t.YYYY = this.getFullYear();
  	t.YY = t.YYYY.toString().slice(-2);
  	t.M = this.getMonth() + 1,
  	t.MM = ('0' + t.M.toString()).slice(-2);
  	t.D = this.getDate();
  	t.DD = ('0' + t.D.toString()).slice(-2);
  	t.h = this.getHours();
  	t.hh = ('0' + t.h.toString()).slice(-2);
  	t.m = this.getMinutes();
  	t.mm = ('0' + t.m.toString()).slice(-2);
	t.s = this.getSeconds();
  	t.ss = ('0' + t.s.toString()).slice(-2);
	t.q = Math.floor((this.getMonth() + 3) / 3);
  	t.qq = ('0' + t.q.toString()).slice(-2);
	t.S = this.getMilliseconds();

	fmt = fmt.replaceAll(/yyyy/ig, t.YYYY).replaceAll(/yy/ig, t.YY)
		.replaceAll('MM', t.MM).replaceAll('M', t.M)
		.replaceAll(/dd/ig, t.DD).replaceAll(/d/ig, t.D)
		.replaceAll(/hh/ig, t.hh).replaceAll(/h/ig, t.h)
		.replaceAll('mm', t.mm).replaceAll('m', t.m)
		.replaceAll('ss', t.ss).replaceAll('s', t.s)
		.replaceAll('S', t.S)
	return fmt;
}

function isNumeric(val) {
	return !isNaN(val - parseFloat(val));
}

/**
 * 从网址中提取参数
 */
function getUrlParam(url, key) {
	try {
		let param = new URL(url).searchParams.get(key);
		return param ? decodeURIComponent(param) : '';
	} catch {}
	return '';
}
