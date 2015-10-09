//全局变量定义
var canvas_width = 1000; //画布宽
var canvas_height = 600; //画布高
var canvas;   //绘图画布
var canvasContext = null;
var canvasBuffer;  //实现双缓冲的中间画布
var canvasBufferContext = null;
var row_number;
var col_number;
var cell_width = 4;
var usr_width = 4;
var is_live;
var is_liveBuffer;
var is_setting_wall = false;
var DrawInterval = 1000 / 10;
var usr_interval = 1000 / 10;
var ratio = 0.5;
var usr_ratio = 0.5;

//定义画布距离屏幕左上角距离
var top_offset;
var left_offset; 
//Bool状态
var is_start = false;
var is_paused;
var is_single;
var is_sizechanged = true;

//游戏主结构
$(window).load(function(){
	//添加事件监视，按钮响应
	addEvent();
	//开始游戏主循环
	Start();
})
function Start(){
	gameLoop = setInterval(GameLoop, DrawInterval);
}
function Restart () {
	clearInterval(gameLoop);
	gameLoop = setInterval(GameLoop, DrawInterval);
}
function GameLoop(){
	if(!is_start)
		return;
	if(is_paused)
		return;
	if(is_setting_wall)
		return;
	Draw();
	Update();
}

//游戏函数
function addEvent(){
	//开始按钮 包括游戏初始化
	$("#start").click(function(){
		is_start = true;
		is_single = false;
		is_paused = false;
		is_setting_wall = false;
		$("#set_wall").remove();
		$("#start").text("重新开始");
		$("#pause").text("暂停");
		if(is_sizechanged){
			cell_width = usr_width;
			if(DrawInterval != usr_interval){
				DrawInterval = usr_interval;
				Restart();
			}
			ratio = usr_ratio;
			$("#current_size").remove();
			$("#current_frequency").remove();
			$("#current_density").remove();
			$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + " 重新开始后细胞大小将改为:" + usr_width + "</div>");
			$('body').append("<div id='current_frequency'>当前频率：" + Math.floor(1000 / DrawInterval) + " 重新开始后频率将改为：" + Math.floor(1000 / usr_interval) + "</div>");
			$('body').append("<div id='current_density'>当前细胞初始存活率：" + ratio + " 重新开始后存活率将改为：" + usr_ratio + "</div>");
			is_setting_wall = true;
			$('body').append("<div id='set_wall'>请设置围墙。</div>");
			$("#start").text("开始");
			is_sizechanged = false;
			Initialize();
			Draw();
		}
		else{
			for(var i = 2; i < row_number + 2; i++){
				for(var j = 2; j < col_number + 2; j++){
					if(is_live[i][j][1] === 0){
						if(Math.floor(Math.random() * 10000) < (ratio * 10000)){
							is_live[i][j][0] = 1;
						}
						else{
							is_live[i][j][0] = 0;
						}
					}
					else{
						is_live[i][j][0] = 0;
					}
					is_liveBuffer[i][j] = is_live[i][j][0];
				}
			}
		}
		
	});

	$("#pause").click(function(){
		if(!is_paused && is_start && !is_single){
			$("#pause").text("继续");
			is_paused = true;
		}
		else{
			if(is_single)
				return;
			$("#pause").text("暂停");
			is_paused = false;
		}
	});

	$("#single").click(function(){
		if(!is_single && is_start){
			is_single = true;
			$("#pause").text("继续");
		}
		else{
			is_paused = false;
		}
	});

	$("#continue").click(function(){
		if(is_single && is_start){
			$("#pause").text("暂停");
			is_single = false;
			is_paused = false;
		}
	});

	$("#ready_frequency").click(function(){
		if(is_start){
			usr_interval = Math.floor(1000 / (eval(document.getElementById("frequency")).value));
			if(usr_interval == DrawInterval){

			}
			else{
				$("#current_size").remove();
				$("#current_frequency").remove();
				$("#current_density").remove();
				$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + " 重新开始后细胞大小将改为:" + usr_width + "</div>");
				$('body').append("<div id='current_frequency'>当前频率：" + Math.floor(1000 / DrawInterval) + " 重新开始后频率将改为：" + Math.floor(1000 / usr_interval) + "</div>");
				$('body').append("<div id='current_density'>当前细胞初始存活率：" + ratio + " 重新开始后存活率将改为：" + usr_ratio + "</div>");
				is_sizechanged = true;
			}
		}
	});

	$("#ready_density").click(function(){
		if(is_start){
			usr_ratio = eval(document.getElementById("density")).value;
			if(usr_ratio == ratio){

			}
			else{
				$("#current_size").remove();
				$("#current_frequency").remove();
				$("#current_density").remove();
				$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + " 重新开始后细胞大小将改为:" + usr_width + "</div>");
				$('body').append("<div id='current_frequency'>当前频率：" + Math.floor(1000 / DrawInterval) + " 重新开始后频率将改为：" + Math.floor(1000 / usr_interval) + "</div>");
				$('body').append("<div id='current_density'>当前细胞初始存活率：" + ratio + " 重新开始后存活率将改为：" + usr_ratio + "</div>");
				is_sizechanged = true;
			}
		}
	});

	$("#ready").click(function(){
		if(is_start){
			usr_width = eval(document.getElementById("size")).value;
			
			if(usr_width == cell_width){

			}
			else{
				$("#current_size").remove();
				$("#current_frequency").remove();
				$("#current_density").remove();
				$('body').append("<div id='current_size'>当前细胞大小：" + cell_width + " 重新开始后细胞大小将改为:" + usr_width + "</div>");
				$('body').append("<div id='current_frequency'>当前频率：" + Math.floor(1000 / DrawInterval) + " 重新开始后频率将改为：" + Math.floor(1000 / usr_interval) + "</div>");
				$('body').append("<div id='current_density'>当前细胞初始存活率：" + ratio + " 重新开始后存活率将改为：" + usr_ratio + "</div>");
				is_sizechanged = true;
			}
		}
	});

	$("#canvas").click(function(e){
		if((e.offsetX - left_offset <= canvas_width) && (e.offsetY - top_offset <= canvas_height)
			&& (e.offsetX - left_offset >= 0) && (e.offsetY - top_offset >= 0) && is_setting_wall){
			is_live[Math.floor((e.offsetY - top_offset) / cell_width) + 2][Math.floor((e.offsetX - left_offset) / cell_width) + 2][1] = -1;
		}
		Draw();
	});
}

//游戏初始化
function Initialize(){

	row_number = Math.floor(canvas_height / cell_width);
	col_number = Math.floor(canvas_width / cell_width);

	var width = document.body.clientwidth;
	canvas = document.getElementById('canvas');
	canvasBuffer = document.createElement('canvas');
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	top_offset = canvas.clientLeft;
	left_offset = canvas.clientTop;
	canvasBuffer.width = canvas.width;
	canvasBuffer.height = canvas.height;
	canvasBufferContext = canvasBuffer.getContext('2d');

	if(canvas){
		canvasContext = canvas.getContext('2d');
	}
	InitializeCell();
}

function InitializeCell(){
	is_live = new Array(row_number + 4);
	is_liveBuffer = new Array(row_number + 4);
	for(var i = 2; i < row_number + 2; i++){
		is_live[i] = new Array(col_number + 4);
		is_liveBuffer[i] = new Array(col_number + 4);
		for(var j = 2; j < col_number + 2; j++){
			is_live[i][j] = new Array(2);
			if(Math.floor(Math.random() * 10000) < (ratio * 10000)){
				is_live[i][j][0] = 1;
				is_liveBuffer[i][j] = 1;
			}
			else{
				is_live[i][j][0] = 0;
				is_liveBuffer[i][j] = 0;
			}
			is_live[i][j][1] = 0;
			is_liveBuffer[i][j] = 0;
		}
	}

	is_live[0] = new Array(col_number + 4);
	is_live[1] = new Array(col_number + 4);
	is_live[row_number + 2] = new Array(col_number + 4);
	is_live[row_number + 3] = new Array(col_number + 4);
	is_liveBuffer[0] = new Array(col_number + 4);
	is_liveBuffer[1] = new Array(col_number + 4);
	is_liveBuffer[row_number + 2] = new Array(col_number + 4); 
	is_liveBuffer[row_number + 3] = new Array(col_number + 4); 

	for(var i = 0; i < col_number + 4; i++){
		is_live[0][i] = 0;
		is_live[1][i] = 0;
		is_live[row_number + 2][i] = 0;
		is_live[row_number + 3][i] = 0;
	}
	for(var i = 0; i < row_number + 4; i++){
		is_live[i][0] = 0;
		is_live[i][1] = 0;
		is_live[i][col_number + 2] = 0; 
		is_live[i][col_number + 3] = 0; 
	}
}


//更新画布
function Update(){
	for(var i = 2; i < row_number + 2; i++){
		for(var j = 2; j < col_number + 2; j++){
			changeState(i, j);
		}
	}

	for(var i = 2; i < row_number + 2; i++){
		for(var j = 2; j < col_number + 2; j++){
			is_live[i][j][0] = is_liveBuffer[i][j];
		}
	}
	if(is_single){
		is_paused = true;
	}
}

//判断是否改变状态
function changeState(i, j){
	var lived_cell = 0;

	lived_cell = is_live[i][j-1][0]+is_live[i][j-2][0]+is_live[i-1][j][0]
				+is_live[i-2][j][0]+is_live[i][j+1][0]+is_live[i][j+2][0]+
				is_live[i+1][j][0]+is_live[i+2][j][0];

	if(lived_cell === 3){
		is_liveBuffer[i][j] = 1 + is_live[i][j][1];
	}
	else if(lived_cell === 2){
		return;
	}
	else{
		is_liveBuffer[i][j] = 0;
	}

}

//画图函数
function Draw(){
	canvasBufferContext.clearRect(0,0,canvasBuffer.width,canvasBuffer.height);
	canvasContext.clearRect(0,0,canvas.width,canvas.height);
	if(is_setting_wall){
		for(var i = 2; i < row_number + 2; i++){
			for(var j = 2; j < col_number + 2; j++){
				canvasBufferContext.save();
				if(is_live[i][j][1] === 0){
					canvasBufferContext.fillStyle = "rgb(255, 255, 255)";
				}
				else{
					canvasBufferContext.fillStyle = "rgb(0, 0, 0)";
				}
				canvasBufferContext.fillRect(cell_width * (j - 2), cell_width * (i - 2), cell_width, cell_width);
				canvasBufferContext.restore();
			}
		}
	}
	else{
		for(var i = 2; i < row_number + 2; i++){
			for(var j = 2; j < col_number + 2; j++){
				canvasBufferContext.save();
				if(is_live[i][j][1] === -1){
					canvasBufferContext.fillStyle = "rgb(0, 255, 0)";
				}
				else if(is_live[i][j][0] === 1){
					canvasBufferContext.fillStyle = "rgb(255, 255, 255)";
				}
				else{
					canvasBufferContext.fillStyle = "rgb(0, 0, 0)";
				}
				canvasBufferContext.fillRect(cell_width * (j - 2), cell_width * (i - 2), cell_width, cell_width);
				canvasBufferContext.restore();
			}
		}
	}
	canvasContext.drawImage(canvasBuffer,0,0);
}


























