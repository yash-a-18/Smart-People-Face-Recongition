Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        var url = "http://localhost:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            /* 
            Below is a sample response if you have two faces in an image lets say virat and roger together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    'class': 'sheldon_cooper', 
                    'class_probability': [27.86, 32.04, 32.29, 1.88, 5.92], 
                    'class_dictionary': {
                                            'dr_apj_abdul_kalam': 0, 
                                            'elon_musk': 1, 
                                            'sheldon_cooper': 2, 
                                            'sherlock_holmes': 3, 
                                            'sundar_pichai': 4
                                        }
                }, 
                {
                    'class': 'sundar_pichai', 
                    'class_probability': [0.88, 0.23, 0.41, 0.2, 98.29], 
                    'class_dictionary': {
                                            'dr_apj_abdul_kalam': 0, 
                                            'elon_musk': 1, 
                                            'sheldon_cooper': 2, 
                                            'sherlock_holmes': 3, 
                                            'sundar_pichai': 4
                                        }
                }
            ]
            */
            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();                
                $("#error").show();
                return;
            }
            let players = ["dr_apj_abdul_kalam", "elon_musk", "sheldon_cooper", "sherlock_holmes", "sundar_pichai"];
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});