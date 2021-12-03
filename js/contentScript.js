
let firstRun = false;
let prevUrls = [];
let activated;
const youtubeCategoryMappings = {
		"1": "Film & Animation",
		"2": "Autos & Vehicles",
		"10": "Music",
		"15": "Pets & Animals",
		"17": "Sports",
		"18": "Short Movies",
		"19": "Travel & Events",
		"20": "Gaming",
		"21": "Videoblogging",
		"22": "People & Blogs",
		"23": "Comedy",
		"24": "Entertainment",
		"25": "News & Politics",
		"26": "Howto & Style",
		"27": "Education",
		"28": "Science & Technology",
		"29": "Nonprofits & Activism",
		"30": "Movies",
		"31": "Anime/Animation",
		"32": "Action/Adventure",
		"33": "Classics",
		"34": "Comedy",
		"35": "Documentary",
		"36": "Drama",
		"37": "Family",
		"38": "Foreign",
		"39": "Horror",
		"40": "Sci-Fi/Fantasy",
		"41": "Thriller",
		"42": "Shorts",
		"43": "Shows",
		"44": "Trailers"
	}

chrome.storage.local.get(['activated'], function(data) {
		activated = data.activated;	
		console.log('Activated value: ' + activated)	

		if (activated == true) {
				console.log('Blocking is activated. Initiating blocking')
				initiate();
		} 
		else {
				console.log('Blocking not activated. Not initiating')
		}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {	
		if (request.query === 'Page updated')
		{
				console.log('Page updated');
				initiate();
		}
 });
 
function initiate() {
		let currentUrl = location.href.split("&")[0];
		if (prevUrls.includes(currentUrl)) {
				console.log('--------- Url already fetched.Not fetching again. ---------')
				return;
		}
		prevUrls.push(currentUrl);
		console.log("Initiating Youtube Study for new url: " + currentUrl);

		chrome.runtime.sendMessage({url: currentUrl}, function(response) {
				console.log("-------Response from send url message: -----------");
				processYoutubeData(response.json, blockYoutubeUrl)
		});
}

function getCategory() {
	videoCategoryString = document.querySelector("meta[itemprop='genre']").getAttribute("content")
	videoCategory = Object.keys(youtubeCategoryMappings).find(key => youtubeCategoryMappings[key] === videoCategoryString)
	return [videoCategory, videoCategoryString]
    // const array = new Uint32Array(5);
    // const handShake = window.crypto.getRandomValues(array).toString();

    // function propagateVariable(handShake) {
    // 	const message = { handShake };
    //  	message['category'] = window['ytInitialPlayerResponse']['microformat']['playerMicroformatRenderer']['category'];
    //  	window.postMessage(message, "*");
    // }
    // (function injectPropagator() {
    //  		const script = `( ${propagateVariable.toString()} )('${handShake}');`
    //  		const scriptTag = document.createElement('script');
    //  		const scriptBody = document.createTextNode(script);

    //  		scriptTag.id = 'chromeExtensionDataPropagator';
    //  		scriptTag.appendChild(scriptBody);
    //  		document.body.append(scriptTag);
	// })();
}

function processYoutubeData(json, callbackBlockYoutubeUrl) {
	chrome.storage.local.get(['categories'], data => {
		console.log(data.categories)
		var allowedIds = data.categories // ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
		categoryData = getCategory()
		let videoCategory = categoryData[0];
		let videoCategoryString = categoryData[1];
		console.log("YouTube Video Category: " + videoCategoryString);
		let isAllowedResult = allowedIds.includes(videoCategory);
		console.log('isAllowedUrl: ' + isAllowedResult);
		if(isAllowedResult == false) {
			callbackBlockYoutubeUrl(videoCategoryString);
		}
	})
}


function blockYoutubeUrl(videoCategoryString) {
		console.log('in blockYoutubeUrl')
		chrome.storage.local.get(['activated'], function(data) {
				console.log('Blocking Activated value: ' + data.activated)
		
				if (data.activated === true) {	
						console.log('---- Sent create notification to background ----');
						// Block redirecting happens here
						location.replace('http://youtube.com')
						chrome.runtime.sendMessage({createNotification: true, videoCategoryString: videoCategoryString}, 
								function(response) {
						});					 
				}
		});
}





