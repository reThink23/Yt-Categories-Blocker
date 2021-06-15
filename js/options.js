var youtubeCategoryMappings = {
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
$(document).ready(function(){
    loadCategories();
    let activated;
    getApiKey();
    $('#saveKey').click(save_options);
    initiateHarderToDeactivateActions();
    initiateActivatedValueActions();

    $('.rotate').on("click", () => {
        $(this).toggleClass("down");
    })

    function initiateActivatedValueActions() {
        chrome.storage.local.get('activated', function(data) {
            if (data.activated === false) {
                activated = false
            } 
            else if (data.activated == true) {
                activated = true;
            }
            console.log('activated value: ' + activated)
        })
    }
    
    function getApiKey() {
        chrome.storage.local.get('apiKey', function(data) {
            let value = ""
            console.log('Key value is: ' + data.apiKey)
            let key = data.apiKey;
            if (key == "") {
                value = "You do not have a key set."
            } 
            else {
                value = "Your current Youtube key is: <b id='key'>" + key + "</b>"
            }
            $('#currKey').html(value)
        })  
    }

    function save_options() {
        if (!isValidKey()) {
            return;
        }
        if (confirm("Are you sure you want to save this key?")) {
            setApiKey()
            alert('You have saved your options')
        }
    }

    function isValidKey() {
        let key = $('#API_KEY').val()
        if (!key) {
            alert("Please enter a key")
            return false;
        }
        return true;
    }
    
    function setApiKey() {
        let key = $('#API_KEY').val()
        console.log(key)
        chrome.storage.local.set({apiKey : key}, function(){
            console.log('set api key: ' + key)
            location.reload()
            chrome.runtime.reload()
        })
    }

    function initiateHarderToDeactivateActions() {
        chrome.storage.local.get('harderDeactivateClicks', function(data) {
            let value = data.harderDeactivateClicks;
            console.log('harderDeactivate value is ' + value)
            if (!value) {
                $('#harder10').prop("checked", true);
                setHarderDeactivateClicks("10");
            }
            else {
                $(`#harder${value}`).prop("checked", true);
            }                      
        }); 
    }

    $("#saveHarderClicks").click(function() {
        let radioVal = $("input[name=clicksRadio]:checked", '#unblock_times').val();
        console.log(radioVal)
        if (activated) {
            alert("You cannot change clicks options when YouTube Study is activated")
        }
        else if (radioVal) {
            alert("You have saved your option for " + radioVal + " clicks.");
            setHarderDeactivateClicks(radioVal);
        }
        else {
            alert("Please set a clicks value");
        }
    })

    function setHarderDeactivateClicks(value) {
        chrome.storage.local.set({harderDeactivateClicks : value}, function(){
            console.log('Set deactivate harder clicks  to ' + value)
            location.reload();
        })
    }

    function logArray(prefix='', array, suffix='', and=false) {
        string = prefix
        for (let i = 0; i < array.length; i++) {
            string += array[i] + (array.length - 1 == i) ? suffix : (and && array.length - 2 == i) ? " and " : ", ";
        }
        console.log(string)
    }

    function setCategories(categories) {
        chrome.storage.local.set({categories : categories}, function(){
            logArray('Following Categories are allowed: ', categories,'.')
            location.reload();
        })
    }

    function getCategories() {
        chrome.storage.local.get(['categories'], data => {
            console.log(data.categories)
            return data.categories
        })
    }

    function loadCategories() {
        var categories = getCategories()
        istoget = (categories) ? true : false
        for (const key in youtubeCategoryMappings) {
            if (Object.hasOwnProperty.call(youtubeCategoryMappings, key)) {
                const cgName = youtubeCategoryMappings[key];
                // console.log(cgName)
                $("#blocked_categories").append(`
                    <input type="checkbox" name="categs" id="${key}" ${(istoget && categories.includes(key)) ? "checked" : ""}>
                    <label for="${key}">${cgName}</label><br>
                `)
            }
        }
        $("#blocked_categories").append(`<br>`)
    }

    $("#setCategories").click(function () {
        let categories = $("input:checkbox[name=categs]:checked").map(()=>{return $(this).val()}).get()
        console.log(categories)
        let isWhitelist = $('#whitelist').val()
        var blacklist = Object.values(youtubeCategoryMappings).filter(categ => !categories.includes(categ));
        var whitelist = Object.values(youtubeCategoryMappings).filter(categ => categories.includes(categ));
        categArray = (isWhitelist) ? whitelist : blacklist
         console.log(categArray)
         if (activated) {
             alert("You cannot change category options when YouTube Study is activated")
         } else if (categArray) {
             logArray("You have saved your option for the Categories: ", categArray, and=true)
            //  alert("You have saved your option for the Categories:" + categories );
             setCategories(categArray);
         } else {
             alert("Please Configure Categories");
         }
     })
 })