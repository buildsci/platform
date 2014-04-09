/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    routes = require('./routes/routes.js'),
    lite = require("./routes/lite.js"),
    partial = require("./routes/partial.js"),
    substantial = require("./routes/substantial.js"),
    mongoose = require('mongoose'),
    NA = require("nodealytics");


var app = express();

mongoose.connect("mongodb://128.118.67.242/test");
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', UserSchema);

var BuildingSchema = new mongoose.Schema({
    username: String,
    building: {
        building_info: {
            building_name: String, //4
            weather_epw_location: String, //4
            year_completed: String, //l,p,c
            activity_type: String, //4
            activity_type_specific: String //s
        },
        architecture: {
            gross_floor_area: String, //l,s,c
            number_of_floors: String, //s,c
            window_to_wall_ratio: String, //s,c
            footprint_shape: String, //s,c
            building_height: String, //s
            perimeter: String, //s
            tightness: String //c
        },
        typical_room: {
            room_width: String, //p
            room_depth: String, //p
            room_height: String, //p
            exterior_shading_orientation: String, //p
            window_to_wall_ratio: String, //p
            number_of_floors: String, //p
            overhang_depth: String //p
        },
        materials: {
            wall_insulation_r_value: String, //p
            thermal_mass: String, //p
            window_glass_coating: String, //p
            window_glass_type: String, //p,s,c
            roof_type: String, //p,s,c
            roof_insulation_type: String, //p
            roof_insulation_location: String, //p
            exterior_wall_type: String //s,c
        },

        people: {
            people_density: String, //p
            number_of_employees_during_main_shift: String //s
        },

        lighting: {
            illuminance: String //p
        },

        mechanical: {
            equipment_power_density: String, //p
            ventilation_system: String, //p
            primary_hvac_type: String //s
            //   electricity_used_for_main_heating: String,      //s
            //   natural_gas_used_for_main_heating: String,      //s
            //   fuel_oil_used_for_main_heating: String,         //s
            //   propane_used_for_main_heating: String,          //s
            //   district_steam_used_for_main_heating: String,    //s
            //   district_hot_water_used_for_main_heating: String,   //s
            //   electricity_used_for_cooling: String,               //s
            //   natural_gas_used_for_cooling: String,               //s
            //   fuel_oil_used_for_cooling: String,                  //s
            //   propane_used_for_cooling: String,                   //s
            //   district_steam_used_for_cooling: String,            //s
            //   district_hot_water_used_for_cooling: String,        //s
            //   district_chilled_water_used_for_cooling: String,    //s
            //   electricity_used_for_water_heating: String,         //s
            //   natural_gas_used_for_water_heating: String,         //s
            //   fuel_oil_used_for_water_heating: String,            //s
            //   propane_used_for_water_heating: String,             //s
            //   district_steam_used_for_water_heating: String,      //s
            //   district_hot_water_used_for_water_heating: String   //s
        },

        schedules: {
            weekday_occupancy_start: String, //p
            weekday_occupancy_end: String, //p
            open_24_hours_a_day: String, //s
            average_weekly_operating_hours: String, //s
            open_during_week: String, //s
            open_on_weekend: String, //s
            weekday_occupancy_hours_day_start: String, //s
            weekday_occupancy_hours_day_end: String, //s
            saturday_occupancy_hours_day_start: String, //s
            saturday_occupancy_hours_day_end: String, //s
            sunday_occupancy_hours_day_start: String, //s
            sunday_occupancy_hours_day_end: String //s
        }
    }

});

var Building = mongoose.model('buildings', BuildingSchema);

var BuildingModelSchema = new mongoose.Schema({
    username: String,
    model: String,

});

var LiteResultSchema = new mongoose.Schema({
    username: String,
    literesult: {
        building_name: String,
        utility_electric: [{
            type: String
        }],
        year_completed: String,
        building_function: String,
        building_location: String,
        EUI: String,
        buildingTypeEUI: String,
        EUI_source: String,
        electric_utility_startdate: [{
            type: String
        }],
        temperatures: [{
            type: String
        }],
        utility_gas: [{
            type: String
        }],
        X_min_gas: String,
        X_max_gas: String,
        Xcp_gas: String,
        Ycp_gas: String,
        Y_gas: String,
        X_min_electric: String,
        X_max_electric: String,
        Xcp_electric: String,
        Ycp_electric: String,
        Y_electric: String,
        insFileElectric: String,
        datFileElectric: String,
        outFileElectric: String,
        resFileElectric: String,
        insFileGas: String,
        datFileGas: String,
        outFileGas: String,
        resFileGas: String
    }

});

var LiteResult = mongoose.model('literesults', LiteResultSchema);

var Buildingmodel = mongoose.model('buildingmodels', BuildingModelSchema);

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
        username: name
    },

    function(err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));

            if (user.password == pass) return fn(null, user);
            else return fn(new Error('invalid password'));

        }
        else {
            return fn(new Error('cannot find user'));
        }
    });

}



// Seting Server environments, ports and rendering
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser("secret"));
app.use(express.session());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//NodeAnalytics
NA.initialize('UA-26348074-7', 'eebhub.org', function() {
    NA.trackPage('Energy Retrofit Game', '/game', function(err, resp) {
        if (!err && resp.statusCode === 200) {
            console.log('Page has been tracked with Google Analytics Game Page');
        }
    });
});



//Get Routing
app.get('/', routes.getHome);
app.get('/team', routes.getTeam);
app.get('/news', routes.getNews);
app.get('/presentation', routes.getPresentation);
app.get('/casestudies', routes.getCaseStudies);
app.get('/engines',routes.getEngines);
app.get('/casestudy',routes.getCaseStudies);
app.get('/visits', routes.getVisits);
app.get('/visitors', routes.getVisits);
app.get('/views', routes.getVisits);
app.get("/signup", function (req, res) {
    res.render("signup");
});
app.get("/signin", function(req, res) {
    res.render("signin");
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    //res.send("Logged out!");
    res.redirect('/');
});

app.get('/eplus_out', function(req, res) {
    var fs = require('fs');
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('../openstudio/eem_1.sql');

    db.serialize(function() {
        //db.run("CREATE TABLE lorem (info TEXT)");

        //   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
        //   for (var i = 0; i < 10; i++) {
        //       stmt.run("Ipsum " + i);
        //   }
        //   stmt.finalize();

        //   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
        //       console.log(row.id + ": " + row.info);
        //   });
        var label = 0;
        db.each("SELECT * FROM Surfaces", function(err, row) {
            var str = row.SurfaceIndex + ',' + row.SurfaceName + ',' + row.Area + '\n';
            console.log(row);
            //dbres = dbres + str;
            if (label === 0) {
                fs.writeFileSync('eem_db.txt', str);
                label = 1;
            }
            else fs.appendFileSync('eem_db.txt', str);

        });
    });
    db.close();
    res.sendfile('eem_db.txt');
});


//app.get('/lite', routes.getLite);
//app.get('/liteconv', routes.getLiteConv);
app.get('/lite', function(req, res) {
    var bldname = '';
    var bld_location = '';
    var bld_function = '';
    var bld_year = '';
    var gross_floor_area = '';

    if (req.session.username && req.session.buildingid) {

        Building.findOne({
            _id: req.session.buildingid
        }, function(err, building) {
            if (err || !building) console.log("No Building found");
            else {
                bldname = building.building.building_info.building_name;
                bld_location = building.building.building_info.weather_epw_location;
                bld_function = building.building.building_info.activity_type;
                bld_year = building.building.building_info.year_completed;
                gross_floor_area = building.building.architecture.gross_floor_area;


                res.render('lite', {
                    'username': req.session.username,
                    'bldname': bldname,
                    'bld_location': bld_location,
                    'bld_function': bld_function,
                    'bld_year': bld_year,
                    'gross_floor_area': gross_floor_area
                });
            }
        });

    }
    else {
        res.render('lite', {
            'username': req.session.username,
            'bldname': '',
            'bld_function': '',
            'bld_year': '',
            'bld_location': '',
            'gross_floor_area': ''
        });
    }
});

app.get('/literesults', routes.getLiteResults);

app.get('/lite/:id', function(req, res) {
    //res.send(req.params.id);
    req.session.buildingid = req.params.id;
    Building.findOne({
        _id: req.params.id
    }, function(e, bld_lite) {
        if (e) res.send(e);
        else { //res.send(bld_lite);
            var bldname = bld_lite.building.building_info.building_name;
            var bld_location = bld_lite.building.building_info.weather_epw_location;
            var bld_year = bld_lite.building.building_info.year_completed;
            var bld_function = bld_lite.building.building_info.activity_type;
            var gross_floor_area = bld_lite.building.architecture.gross_floor_area;
            //console.log(building_name);
            res.render('lite', {
                'username': req.session.username,
                'bldname': bldname,
                'bld_location': bld_location,
                'bld_year': bld_year,
                'bld_function': bld_function,
                'gross_floor_area': gross_floor_area
            });

        }
    });

});


//app.get('/partial', routes.getPartial);
app.get('/partial', function(req, res) {
    var bldname = '';
    var bld_location = '';
    var bld_function = '';
    var bld_year = '';
    var room_width = '';
    var room_depth = '';
    var room_height = '';
    var exterior_shading_orientation = '';
    var window_to_wall_ratio = '';
    var number_of_floors = '';
    var overhang_depth = '';
    var wall_insulation_r_value = '';
    var thermal_mass = '';
    var window_glass_coating = '';
    var window_glass_type = '';
    var roof_type = '';
    var roof_insulation_type = '';
    var roof_insulation_location = '';
    var people_density = '';
    var illuminance = '';
    var equipment_power_density = '';
    var ventilation_system = '';
    var weekday_occupancy_start = '';
    var weekday_occupancy_end = '';
    if (req.session.username && req.session.buildingid) {

        Building.findOne({
            _id: req.session.buildingid
        }, function(err, building) {
            if (err || !building) console.log("No Building found");
            else {
                console.log(building);
                bldname = building.building.building_info.building_name;
                console.log(bldname);
                bld_location = building.building.building_info.weather_epw_location;
                bld_function = building.building.building_info.activity_type;
                bld_year = building.building.building_info.year_completed;
                room_width = building.building.typical_room.room_width;
                room_depth = building.building.typical_room.room_depth;
                room_height = building.building.typical_room.room_height;
                exterior_shading_orientation = building.building.typical_room.exterior_shading_orientation;
                window_to_wall_ratio = building.building.typical_room.window_to_wall_ratio;
                number_of_floors = building.building.typical_room.number_of_floors;
                overhang_depth = building.building.typical_room.overhang_depth;
                wall_insulation_r_value = building.building.materials.wall_insulation_r_value;
                thermal_mass = building.building.materials.thermal_mass;
                window_glass_coating = building.building.materials.window_glass_coating;
                window_glass_type = building.building.materials.window_glass_type;
                roof_type = building.building.materials.roof_type;
                roof_insulation_type = building.building.materials.roof_insulation_type;
                roof_insulation_location = building.building.materials.roof_insulation_location;
                people_density = building.building.people.people_density;
                illuminance = building.building.lighting.illuminance;
                equipment_power_density = building.building.mechanical.equipment_power_density;
                ventilation_system = building.building.mechanical.ventilation_system;
                weekday_occupancy_start = building.building.schedules.weekday_occupancy_start;
                weekday_occupancy_end = building.building.schedules.weekday_occupancy_end;

                res.render('partial', {
                    'username': req.session.username,
                    'bldname': bldname,
                    'bld_location': bld_location,
                    'bld_function': bld_function,
                    'bld_year': bld_year,
                    'room_width': room_width,
                    'room_depth': room_depth,
                    'room_height': room_height,
                    'exterior_shading_orientation': exterior_shading_orientation,
                    'window_to_wall_ratio': window_to_wall_ratio,
                    'number_of_floors': number_of_floors,
                    'overhang_depth': overhang_depth,
                    'wall_insulation_r_value': wall_insulation_r_value,
                    'thermal_mass': thermal_mass,
                    'window_glass_coating': window_glass_coating,
                    'window_glass_type': window_glass_type,
                    'roof_type': roof_type,
                    'roof_insulation_type': roof_insulation_type,
                    'roof_insulation_location': roof_insulation_location,
                    'people_density': people_density,
                    'illuminance': illuminance,
                    'equipment_power_density': equipment_power_density,
                    'ventilation_system': ventilation_system,
                    'weekday_occupancy_start': weekday_occupancy_start,
                    'weekday_occupancy_end': weekday_occupancy_end
                });
            }
        });
    }
    else {
        res.render('partial', {
            'username': req.session.username,
            'bldname': '',
            'bld_function': '',
            'bld_year': '',
            'bld_location': '',
            'room_width': '',
            'room_depth': '',
            'room_height': '',
            'exterior_shading_orientation': '',
            'window_to_wall_ratio': '',
            'number_of_floors': '',
            'overhang_depth': '',
            'wall_insulation_r_value': '',
            'thermal_mass': '',
            'window_glass_coating': '',
            'window_glass_type': '',
            'roof_type': '',
            'roof_insulation_type': '',
            'roof_insulation_location': '',
            'people_density': '',
            'illuminance': '',
            'equipment_power_density': '',
            'ventilation_system': '',
            'weekday_occupancy_start': '',
            'weekday_occupancy_end': ''
        });
    }
});


//app.get('/substantial', routes.getSubstantial);
app.get('/substantial', function(req, res) {
    var bldname = '';
    var bld_location = '';
    var bld_function = '';
    var activity_type_specific = '';
    var gross_floor_area = '';
    var number_of_floors = '';
    var window_to_wall_ratio = '';
    var footprint_shape = '';
    var building_height = '';
    var perimeter = '';
    var window_glass_type = '';
    var roof_type = '';
    var exterior_wall_type = '';
    var number_of_employees_during_main_shift = '';
    var primary_hvac_type = '';

    var average_weekly_operating_hours = '';
    var open_during_week = '';

    var weekday_occupancy_hours_day_start = '';
    var weekday_occupancy_hours_day_end = '';

    if (req.session.username && req.session.buildingid) {

        Building.findOne({
            _id: req.session.buildingid
        }, function(err, building) {
            if (err || !building) console.log("No Building found");
            else {
                bldname = building.building.building_info.building_name;
                bld_location = building.building.building_info.weather_epw_location;
                bld_function = building.building.building_info.activity_type;
                gross_floor_area = building.building.architecture.gross_floor_area;
                activity_type_specific = building.building.building_info.activity_type_specific;
                number_of_floors = building.building.architecture.number_of_floors;
                window_to_wall_ratio = building.building.architecture.window_to_wall_ratio;
                footprint_shape = building.building.architecture.footprint_shape;
                building_height = building.building.architecture.building_height;
                perimeter = building.building.architecture.perimeter;
                window_glass_type = building.building.materials.window_glass_type;
                roof_type = building.building.materials.roof_type;
                exterior_wall_type = building.building.materials.exterior_wall_type;
                number_of_employees_during_main_shift = building.building.people.number_of_employees_during_main_shift;
                primary_hvac_type = building.building.mechanical.primary_hvac_type;

                average_weekly_operating_hours = building.building.schedules.average_weekly_operating_hours;
                open_during_week = building.building.schedules.open_during_week;

                weekday_occupancy_hours_day_start = building.building.schedules.weekday_occupancy_hours_day_start;
                weekday_occupancy_hours_day_end = building.building.schedules.weekday_occupancy_hours_day_end;

                res.render('substantial', {
                    'username': req.session.username,
                    'bldname': bldname,
                    'bld_location': bld_location,
                    'bld_function': bld_function,
                    'activity_type_specific': activity_type_specific,
                    'gross_floor_area': gross_floor_area,
                    'number_of_floors': number_of_floors,
                    'window_to_wall_ratio': window_to_wall_ratio,
                    'footprint_shape': footprint_shape,
                    'building_height': building_height,
                    'perimeter': perimeter,
                    'window_glass_type': window_glass_type,
                    'roof_type': roof_type,
                    'exterior_wall_type': exterior_wall_type,
                    'number_of_employees_during_main_shift': number_of_employees_during_main_shift,
                    'primary_hvac_type': primary_hvac_type,
                    'average_weekly_operating_hours': average_weekly_operating_hours,
                    'open_during_week': open_during_week,
                    'weekday_occupancy_hours_day_start': weekday_occupancy_hours_day_start,
                    'weekday_occupancy_hours_day_end': weekday_occupancy_hours_day_end
                });
            }
        });



    }
    else {
        res.render('substantial', {
            'username': req.session.username,
            'bldname': '',
            'bld_function': '',
            'bld_location': '',
            'activity_type_specific': '',
            'gross_floor_area': '',
            'number_of_floors': '',
            'window_to_wall_ratio': '',
            'footprint_shape': '',
            'building_height': '',
            'perimeter': '',
            'window_glass_type': '',
            'roof_type': '',
            'exterior_wall_type': '',
            'number_of_employees_during_main_shift': '',
            'primary_hvac_type': '',
            'average_weekly_operating_hours': '',
            'open_during_week': '',
            'weekday_occupancy_hours_day_start': '',
            'weekday_occupancy_hours_day_end': ''
        });
    }
});


//app.get('/comprehensive', routes.getComprehensive);
app.get('/comprehensive', function(req, res) {
    var bldname = '';
    var bld_location = '';
    var bld_function = '';
    var bld_year = '';
    var gross_floor_area = '';
    var number_of_floors = '';
    var window_to_wall_ratio = '';
    var footprint_shape = '';
    var tightness = '';
    var window_glass_type = '';
    var roof_type = '';
    var exterior_wall_type = '';
    var room_width = '';
    var room_depth = '';
    var room_height = '';
    var overhang_depth = '';

    if (req.session.username && req.session.buildingid) {

        Building.findOne({
            _id: req.session.buildingid
        }, function(err, building) {
            if (err || !building) console.log("No Building found");
            else {
                bldname = building.building.building_info.building_name;
                bld_location = building.building.building_info.weather_epw_location;
                bld_function = building.building.building_info.activity_type;
                bld_year = building.building.building_info.year_completed;
                gross_floor_area = building.building.architecture.gross_floor_area;
                number_of_floors = building.building.architecture.number_of_floors;
                window_to_wall_ratio = building.building.architecture.window_to_wall_ratio;
                footprint_shape = building.building.architecture.footprint_shape;
                tightness = building.building.architecture.tightness;
                window_glass_type = building.building.materials.window_glass_type;
                roof_type = building.building.materials.roof_type;
                exterior_wall_type = building.building.materials.exterior_wall_type;
                room_width = building.building.typical_room.room_width;
                room_depth = building.building.typical_room.room_depth;
                room_height = building.building.typical_room.room_height;
                overhang_depth = building.building.typical_room.overhang_depth;

                res.render('comprehensive', {
                    'username': req.session.username,
                    'bldname': bldname,
                    'bld_location': bld_location,
                    'bld_function': bld_function,
                    'bld_year': bld_year,
                    'gross_floor_area': gross_floor_area,
                    'number_of_floors': number_of_floors,
                    'window_to_wall_ratio': window_to_wall_ratio,
                    'footprint_shape': footprint_shape,
                    'tightness': tightness,
                    'window_glass_type': window_glass_type,
                    'roof_type': roof_type,
                    'exterior_wall_type': exterior_wall_type,
                    'room_width': room_width,
                    'room_depth': room_depth,
                    'room_height': room_height,
                    'overhang_depth': overhang_depth
                });
            }
        });

    }
    else {
        res.render('comprehensive', {
            'username': req.session.username,
            'bldname': bldname,
            'bld_location': bld_location,
            'bld_function': bld_function,
            'bld_year': bld_year,
            'gross_floor_area': gross_floor_area,
            'number_of_floors': number_of_floors,
            'window_to_wall_ratio': window_to_wall_ratio,
            'footprint_shape': footprint_shape,
            'tightness': tightness,
            'window_glass_type': window_glass_type,
            'roof_type': roof_type,
            'exterior_wall_type': exterior_wall_type,
            'room_width': room_width,
            'room_depth': room_depth,
            'room_height': room_height,
            'overhang_depth': overhang_depth
        });
    }

});

app.get('/substantialsampleres', substantial.getSubstantialSampleRes);
app.get('/substantialsampleres-energyuse', substantial.getSubstantialSampleResEnergyUse);
app.get('/substantialsampleres-stage1', substantial.getSubstantialSampleResStage1);
app.get('/substantialsampleres-stage2', substantial.getSubstantialSampleResStage2);

app.get("/mydashboard", function(req, res) {
    if (req.session.username) {
        res.render('dashboard', {
            'username': req.session.username,
        });
    }
    else {
        res.redirect('/signin');
    }
});

app.get("/mybuildings", function(req, res) {
    var buildinglist = [];
    var buildingnamelist = [];
    var yearlist = [];
    var locationlist = [];
    Building.find({
        username: req.session.username
    }, function(err, docs) {
        if (err) res.send(err);
        else {
            docs.forEach(function(doc) {
                buildinglist.push(doc._id);
                buildingnamelist.push(doc.building.building_info.building_name);
                yearlist.push(doc.building.building_info.year_completed);
                locationlist.push(doc.building.building_info.weather_epw_location);
            });

            //res.send(buildinglist);
            res.render('buildings', {
                'username': req.session.username,
                'buildinglist': buildinglist,
                'buildingnamelist': buildingnamelist,
                'yearlist': yearlist,
                'locationlist': locationlist
            });
        }
    });
});

app.get("/myresults", function(req, res) {
    //     Buildingmodel.find({username: req.session.username}, function (err, docs) {
    //     console.log(docs.length);    
    //      res.send(docs.length+ "building models:\n"+docs);
    // });
    res.render('results', {
        'username': req.session.username
    });

});

app.get("/addnewbuilding", function(req, res) {
    if (!req.session.buildingid) {
        res.redirect('/lite');
    }
    else {
        req.session.buildingid = null;
        res.redirect('/lite');
    }
});

app.get('/mybuildings/:id', function(req, res) {
    //res.send('user' + req.params.id);
    Building.findOne({
        _id: req.params.id
    }, function(e, result) {
        if (e) res.send(e);
        else res.send(result);
    });
});

app.get('/literesult/:id', function(req, res) {
    LiteResult.findOne({
        _id: req.params.id
    }, function(e, result) {
        if (e) res.send(e);
        else {
            //res.send(result.literesult);
            res.render('imtresults_3p', {
                'username': 'undefined',
                'building_name': result.literesult.building_name,
                'year_completed': result.literesult.year_completed,
                'building_function': result.literesult.building_function,
                'building_location': result.literesult.building_location,
                'EUI': result.literesult.EUI,
                'buildingTypeEUI': result.literesult.buildingTypeEUI,
                'EUI_source': result.literesult.EUI_source,
                'electric_utility_startdate': result.literesult.electric_utility_startdate,
                'temperatures': result.literesult.temperatures,
                'utility_electric': result.literesult.utility_electric,
                'utility_gas': result.literesult.utility_gas,
                'X_min_gas': result.literesult.X_min_gas,
                'X_max_gas': result.literesult.X_max_gas,
                'Xcp_gas': result.literesult.Xcp_gas,
                'Ycp_gas': result.literesult.Ycp_gas,
                'Y_gas': result.literesult.Y_gas,
                'X_min_electric': result.literesult.X_min_electric,
                'X_max_electric': result.literesult.X_max_electric,
                'Xcp_electric': result.literesult.Xcp_electric,
                'Ycp_electric': result.literesult.Ycp_electric,
                'Y_electric': result.literesult.Y_electric,
                'insFileElectric': result.literesult.insFileElectric,
                'datFileElectric': result.literesult.dataFileElectric,
                'outFileElectric': result.literesult.outFileElectric,
                'resFileElectric': result.literesult.resFileElectric,
                'insFileGas': result.literesult.insFileGas,
                'datFileGas': result.literesult.dataFileGas,
                'outFileGas': result.literesult.outFileGas,
                'resFileGas': result.literesult.resFileGas
            });
        }
    });
});

app.get('/removebuilding/:id', function(req, res) {
    Building.remove({
        _id: req.params.id
    }, function(e, result) {
        if (e) res.send(e);
        else res.redirect('/mybuildings');
    });
});


//Posts
app.post('/partialanalysis', partial.partial);
//app.post('/substantialresults', substantial.getSubstantialInput);
app.post('/substantialresults', substantial.getSubstantialResults);

app.post('/imtanalysis', lite.runIMT);
app.post('/ibmanalysis', lite.ibm);

app.post("/signup", function(req, res) {

    User.count({
        username: req.body.username
    }, function(err, count) {
        console.log(count);
        if (count === 0) {
            //hash(req.body.password, function (err, salt, hash) {
            //if (err) throw err;
            var user = new User({
                username: req.body.username,
                password: req.body.userpassword,
                salt: '',
                hash: '',
            }).save();
            //res.redirect('/');
            //res.send("Welcome "+req.body.username);		
            req.session.username = req.body.username;
            console.log(req.session);
            //   res.render('substantialwelcome', {
            //   'username': req.body.username,     
            //   });
            res.send("Success!");


        }
        else {
            req.session.error = "User Exist";
            console.log(req.session.error);
            res.send(req.session.error);
            //res.redirect("/signup");
        }
    });


});

app.post("/mydashboard", function(req, res) {
    authenticate(req.body.username, req.body.password, function(err, user) {
        if (user) {

            req.session.regenerate(function() {

                req.session.username = user.username;
                //req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                //             res.render('substantialwelcome', {
                //       'username': req.body.username,     
                //   });

                res.render('dashboard', {
                    'username': req.session.username,
                });
            });
        }
        else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/signin');
        }
    });
});

app.post("/savebuildinglite", function(req, res) {
    if (req.session.buildingid) {
        Building.update({
            username: req.session.username,
            _id: req.session.buildingid
        }, {
            $set: {
                "building.building_info.building_name": req.body.building_name,
                "building.building_info.weather_epw_location": req.body.weather_epw_location,
                "building.building_info.activity_type": req.body.activity_type,
                "building.building_info.year_completed": req.body.year_completed,
                "building.architecture.gross_floor_area": req.body.gross_floor_area
            }
        }, {
            upsert: true,
            safe: false
        },

        function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
                res.send("building info (lite) saved!");
            }
        });

    }
    else {
        new Building({
            username: req.session.username,
            building: {
                building_info: {
                    building_name: req.body.building_name, //4
                    weather_epw_location: req.body.weather_epw_location, //4
                    year_completed: req.body.year_completed, //l,p,c
                    activity_type: req.body.activity_type, //4
                    activity_type_specific: '' //s
                },
                architecture: {
                    gross_floor_area: req.body.gross_floor_area, //l,s,c
                    number_of_floors: '', //s,c
                    window_to_wall_ratio: '', //s,c
                    footprint_shape: '', //s,c
                    building_height: '', //s
                    perimeter: '', //s
                    tightness: '' //c
                },
                typical_room: {
                    room_width: '', //p
                    room_depth: '', //p
                    room_height: '', //p
                    exterior_shading_orientation: '', //p
                    window_to_wall_ratio: '', //p
                    number_of_floors: '', //p
                    overhang_depth: '' //p
                },
                materials: {
                    wall_insulation_r_value: '', //p
                    thermal_mass: '', //p
                    window_glass_coating: '', //p
                    window_glass_type: '', //p,s,c
                    roof_type: '', //p,s,c
                    roof_insulation_type: '', //p
                    roof_insulation_location: '', //p
                    exterior_wall_type: '' //s,c
                },

                people: {
                    people_density: '', //p
                    number_of_employees_during_main_shift: '' //s
                },

                lighting: {
                    illuminance: '' //p
                },

                mechanical: {
                    equipment_power_density: '', //p
                    ventilation_system: '', //p
                    primary_hvac_type: '' //s
                },

                schedules: {
                    weekday_occupancy_start: '', //p
                    weekday_occupancy_end: '', //p
                    open_24_hours_a_day: '', //s
                    average_weekly_operating_hours: '', //s
                    open_during_week: '', //s
                    open_on_weekend: '', //s
                    weekday_occupancy_hours_day_start: '', //s
                    weekday_occupancy_hours_day_end: '', //s
                    saturday_occupancy_hours_day_start: '', //s
                    saturday_occupancy_hours_day_end: '', //s
                    sunday_occupancy_hours_day_start: '', //s
                    sunday_occupancy_hours_day_end: '' //s
                }
            }

        }).save(function(err, building) {
            if (err || !building) res.send(err);
            else {
                req.session.buildingid = building._id;
                res.send("building info (lite) created!");
            }

        });


    }
});

app.post('/saveimtresult', function(req, res) {
    //res.send(req.body);
    new LiteResult({
        username: req.session.username,
        literesult: {
            building_name: req.body.building_name,
            utility_electric: req.body.utility_electric,
            year_completed: req.body.year_completed,
            building_function: req.body.building_function,
            building_location: req.body.building_location,
            EUI: req.body.EUI,
            buildingTypeEUI: req.body.buildingTypeEUI,
            EUI_source: req.body.EUI_source,
            electric_utility_startdate: req.body.electric_utility_startdate,
            temperatures: req.body.temperatures,
            utility_gas: req.body.utility_gas,
            X_min_gas: req.body.X_min_gas,
            X_max_gas: req.body.X_max_gas,
            Xcp_gas: req.body.Xcp_gas,
            Ycp_gas: req.body.Ycp_gas,
            Y_gas: req.body.Y_gas,
            X_min_electric: req.body.X_min_electric,
            X_max_electric: req.body.X_max_electric,
            Xcp_electric: req.body.Xcp_electric,
            Ycp_electric: req.body.Ycp_electric,
            Y_electric: req.body.Y_electric,
            insFileElectric: req.body.insFileElectric,
            datFileElectric: req.body.datFileElectric,
            outFileElectric: req.body.outFileElectric,
            resFileElectric: req.body.resFileElectric,
            insFileGas: req.body.insFileGas,
            datFileGas: req.body.datFileGas,
            outFileGas: req.body.outFileGas,
            resFileGas: req.body.resFileGas
        }

    }).save(function(err, literesult) {
        if (err) res.send(err);
        else res.send(literesult);
    });
});

app.post('/savebuildingpartial', function(req, res) {

    if (req.session.buildingid) {
        Building.update({
            username: req.session.username,
            _id: req.session.buildingid
        }, {
            $set: {
                "building.building_info.building_name": req.body.building_name,
                "building.building_info.activity_type": req.body.activity_type,
                "building.building_info.weather_epw_location": req.body.weather_epw_location,
                "building.building_info.year_completed": req.body.year_completed,
                "building.typical_room.room_width": req.body.room_width,
                "building.typical_room.room_depth": req.body.room_depth,
                "building.typical_room.room_height": req.body.room_height,
                "building.typical_room.exterior_shading_orientation": req.body.exterior_shading_orientation,
                "building.typical_room.window_to_wall_ratio": req.body.window_to_wall_ratio,
                "building.typical_room.number_of_floors": req.body.number_of_floors,
                "building.typical_room.overhang_depth": req.body.overhang_depth,
                "building.materials.wall_insulation_r_value": req.body.wall_insulation_r_value,
                "building.materials.thermal_mass": req.body.thermal_mass,
                "building.materials.window_glass_coating": req.body.window_glass_coating,
                "building.materials.window_glass_type": req.body.window_glass_type,
                "building.materials.roof_type": req.body.roof_type,
                "building.materials.roof_insulation_type": req.body.roof_insulation_type,
                "building.materials.roof_insulation_location": req.body.roof_insulation_location,
                "building.people.people_density": req.body.people_density,
                "building.lighting.illuminance": req.body.illuminance,
                "building.mechanical.equipment_power_density": req.body.equipment_power_density,
                "building.mechanical.ventilation_system": req.body.ventilation_system,
                "building.schedules.weekday_occupancy_start": req.body.weekday_occupancy_start,
                "building.schedules.weekday_occupancy_end": req.body.weekday_occupancy_end
            }
        }, {
            upsert: true,
            safe: false
        },

        function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
                res.send("building info (partial) saved!");
            }
        });
    }
    else {

        new Building({
            username: req.session.username,
            building: {
                building_info: {
                    building_name: req.body.building_name, //4
                    weather_epw_location: req.body.weather_epw_location, //4
                    year_completed: req.body.year_completed, //l,p,c
                    activity_type: req.body.activity_type, //4
                    activity_type_specific: '' //s
                },
                architecture: {
                    gross_floor_area: '', //l,s,c
                    number_of_floors: '', //s,c
                    window_to_wall_ratio: '', //s,c
                    footprint_shape: '', //s,c
                    building_height: '', //s
                    perimeter: '', //s
                    tightness: '' //c
                },
                typical_room: {
                    room_width: req.body.room_width, //p
                    room_depth: req.body.room_depth, //p
                    room_height: req.body.room_height, //p
                    exterior_shading_orientation: req.body.exterior_shading_orientation, //p
                    window_to_wall_ratio: req.body.window_to_wall_ratio, //p
                    number_of_floors: req.body.number_of_floors, //p
                    overhang_depth: req.body.overhang_depth //p
                },
                materials: {
                    wall_insulation_r_value: req.body.wall_insulation_r_value, //p
                    thermal_mass: req.body.thermal_mass, //p
                    window_glass_coating: req.body.window_glass_coating, //p
                    window_glass_type: req.body.window_glass_type, //p,s,c
                    roof_type: req.body.roof_type, //p,s,c
                    roof_insulation_type: req.body.roof_insulation_type, //p
                    roof_insulation_location: req.body.roof_insulation_location, //p
                    exterior_wall_type: '' //s,c
                },

                people: {
                    people_density: req.body.people_density, //p
                    number_of_employees_during_main_shift: '' //s
                },

                lighting: {
                    illuminance: req.body.illuminance //p
                },

                mechanical: {
                    equipment_power_density: req.body.equipment_power_density, //p
                    ventilation_system: req.body.ventilation_system, //p
                    primary_hvac_type: '' //s
                },

                schedules: {
                    weekday_occupancy_start: req.body.weekday_occupancy_start, //p
                    weekday_occupancy_end: req.body.weekday_occupancy_end, //p
                    open_24_hours_a_day: '', //s
                    average_weekly_operating_hours: '', //s
                    open_during_week: '', //s
                    open_on_weekend: '', //s
                    weekday_occupancy_hours_day_start: '', //s
                    weekday_occupancy_hours_day_end: '', //s
                    saturday_occupancy_hours_day_start: '', //s
                    saturday_occupancy_hours_day_end: '', //s
                    sunday_occupancy_hours_day_start: '', //s
                    sunday_occupancy_hours_day_end: '' //s
                }
            }

        }).save(function(err, building) {
            if (err) res.send(err);
            else {
                req.session.buildingid = building._id;
                res.send("building info (partial) created!");
            }
        });
    }

});

app.post('/savebuildingsubstantial', function(req, res) {
    if (req.session.buildingid) {
        Building.update({
            username: req.session.username,
            _id: req.session.buildingid
        }, {
            $set: {
                "building.building_info.building_name": req.body.building_name,
                "building.building_info.activity_type": req.body.activity_type,
                "building.building_info.weather_epw_location": req.body.weather_epw_location,
                "building.building_info.activity_type_specific": req.body.activity_type_specific, //s
                "building.architecture.gross_floor_area": req.body.gross_floor_area, //l,s,c
                "building.architecture.number_of_floors": req.body.number_of_floors, //s,c
                "building.architecture.window_to_wall_ratio": req.body.window_to_wall_ratio, //s,c
                "building.architecture.footprint_shape": req.body.footprint_shape, //s,c
                "building.architecture.building_height": req.body.building_height, //s
                "building.architecture.perimeter": req.body.perimeter, //s   
                "building.materials.window_glass_type": req.body.window_glass_type, //p,s,c
                "building.materials.roof_type": req.body.roof_type, //p,s,c
                "building.materials.exterior_wall_type": req.body.exterior_wall_type, //s,c
                "building.people.number_of_employees_during_main_shift": req.body.number_of_employees_during_main_shift, //s
                "building.mechanical.primary_hvac_type": req.body.primary_hvac_type, //s

                "building.schedules.average_weekly_operating_hours": req.body.average_weekly_operating_hours, //s
                "building.schedules.open_during_week": req.body.open_during_week, //s

                "building.schedules.weekday_occupancy_hours_day_start": req.body.weekday_occupancy_hours_day_start, //s
                "building.schedules.weekday_occupancy_hours_day_end": req.body.weekday_occupancy_hours_day_end //s
                //other 6 attributes of schedules are not saveds
            }
        }, {
            upsert: true,
            safe: false
        },

        function(err, data) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("building info (substantial) saved!");
            }
        });
    }
    else {
        var open_24_hours_a_day = 'off';
        var open_during_week = 'off';
        var open_on_weekend = 'off';
        if (req.body.open_24_hours_a_day) open_24_hours_a_day = req.body.open_24_hours_a_day;
        if (req.body.open_during_week) open_during_week = req.body.open_during_week;
        if (req.body.open_on_weekend) open_on_weekend = req.body.open_on_weekend;

        new Building({
            username: req.session.username,
            building: {
                building_info: {
                    building_name: req.body.building_name, //4
                    weather_epw_location: req.body.weather_epw_location, //4
                    year_completed: '', //l,p,c
                    activity_type: req.body.activity_type, //4
                    activity_type_specific: req.body.activity_type_specific //s
                },
                architecture: {
                    gross_floor_area: req.body.gross_floor_area, //l,s,c
                    number_of_floors: req.body.number_of_floors, //s,c
                    window_to_wall_ratio: req.body.window_to_wall_ratio, //s,c
                    footprint_shape: req.body.footprint_shape, //s,c
                    building_height: req.body.building_height, //s
                    perimeter: req.body.perimeter, //s
                    tightness: '' //c
                },
                typical_room: {
                    room_width: '', //p
                    room_depth: '', //p
                    room_height: '', //p
                    exterior_shading_orientation: '', //p
                    window_to_wall_ratio: '', //p
                    number_of_floors: '', //p
                    overhang_depth: '' //p
                },
                materials: {
                    wall_insulation_r_value: '', //p
                    thermal_mass: '', //p
                    window_glass_coating: '', //p
                    window_glass_type: req.body.window_glass_type, //p,s,c
                    roof_type: req.body.roof_type, //p,s,c
                    roof_insulation_type: '', //p
                    roof_insulation_location: '', //p
                    exterior_wall_type: req.body.exterior_wall_type //s,c
                },

                people: {
                    people_density: '', //p
                    number_of_employees_during_main_shift: req.body.number_of_employees_during_main_shift //s
                },

                lighting: {
                    illuminance: '' //p
                },

                mechanical: {
                    equipment_power_density: '', //p
                    ventilation_system: '', //p
                    primary_hvac_type: req.body.primary_hvac_type //s
                },

                schedules: {
                    weekday_occupancy_start: '', //p
                    weekday_occupancy_end: '', //p
                    open_24_hours_a_day: open_24_hours_a_day, //s
                    average_weekly_operating_hours: req.body.average_weekly_operating_hours, //s
                    open_during_week: open_during_week, //s
                    open_on_weekend: open_on_weekend, //s
                    weekday_occupancy_hours_day_start: req.body.weekday_occupancy_hours_day_start, //s
                    weekday_occupancy_hours_day_end: req.body.weekday_occupancy_hours_day_end, //s
                    saturday_occupancy_hours_day_start: req.body.saturday_occupancy_hours_day_start, //s
                    saturday_occupancy_hours_day_end: req.body.saturday_occupancy_hours_day_end, //s
                    sunday_occupancy_hours_day_start: req.body.sunday_occupancy_hours_day_start, //s
                    sunday_occupancy_hours_day_end: req.body.sunday_occupancy_hours_day_end //s
                }
            }

        }).save(function(err, building) {
            req.session.buildingid = building._id;
            res.send("building info (substantial) created!");
        });

    }
});

app.post('/savebuildingcomprehensive', function(req, res) {
    if (req.session.buildingid) {
        Building.update({
            username: req.session.username,
            _id: req.session.buildingid
        }, {
            $set: {
                "building.building_info.building_name": req.body.building_name,
                "building.building_info.weather_epw_location": req.body.weather_epw_location,
                "building.building_info.activity_type": req.body.activity_type,
                "building.building_info.year_completed": req.body.year_completed,
                "building.architecture.tightness": req.body.tightness,
                "building.architecture.number_of_floors": req.body.number_of_floors,
                "building.architecture.window_to_wall_ratio": req.body.window_to_wall_ratio,
                "building.architecture.footprint_shape": req.body.footprint_shape,
                "building.materials.roof_type": req.body.roof_type,
                "building.materials.exterior_wall_type": req.body.exterior_wall_type
            }
        }, {
            upsert: true,
            safe: false
        },

        function(err, data) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("building info (comprehensive) saved!");
            }
        });

    }
    else {

        new Building({
            username: req.session.username,
            building: {
                building_info: {
                    building_name: req.body.building_name, //4
                    weather_epw_location: req.body.weather_epw_location, //4
                    year_completed: req.body.year_completed, //l,p,c
                    activity_type: req.body.activity_type, //4
                    activity_type_specific: '' //s
                },
                architecture: {
                    gross_floor_area: '', //l,s,c
                    number_of_floors: req.body.number_of_floors, //s,c
                    window_to_wall_ratio: req.body.window_to_wall_ratio, //s,c
                    footprint_shape: req.body.footprint_shape, //s,c
                    building_height: '', //s
                    perimeter: '', //s
                    tightness: req.body.tightness //c
                },
                typical_room: {
                    room_width: '', //p
                    room_depth: '', //p
                    room_height: '', //p
                    exterior_shading_orientation: '', //p
                    window_to_wall_ratio: '', //p
                    number_of_floors: '', //p
                    overhang_depth: '' //p
                },
                materials: {
                    wall_insulation_r_value: '', //p
                    thermal_mass: '', //p
                    window_glass_coating: '', //p
                    window_glass_type: '', //p,s,c
                    roof_type: req.body.roof_type, //p,s,c
                    roof_insulation_type: '', //p
                    roof_insulation_location: '', //p
                    exterior_wall_type: req.body.exterior_wall_type //s,c
                },

                people: {
                    people_density: '', //p
                    number_of_employees_during_main_shift: '' //s
                },

                lighting: {
                    illuminance: '' //p
                },

                mechanical: {
                    equipment_power_density: '', //p
                    ventilation_system: '', //p
                    primary_hvac_type: '' //s
                },

                schedules: {
                    weekday_occupancy_start: '', //p
                    weekday_occupancy_end: '', //p
                    open_24_hours_a_day: '', //s
                    average_weekly_operating_hours: '', //s
                    open_during_week: '', //s
                    open_on_weekend: '', //s
                    weekday_occupancy_hours_day_start: '', //s
                    weekday_occupancy_hours_day_end: '', //s
                    saturday_occupancy_hours_day_start: '', //s
                    saturday_occupancy_hours_day_end: '', //s
                    sunday_occupancy_hours_day_start: '', //s
                    sunday_occupancy_hours_day_end: '' //s
                }
            }

        }).save(function(err, building) {
            req.session.buildingid = building._id;
            res.send("building info (comprehensive) created!");
        });
    }
});



//ReRoutes / ReDirects / Easy Links for Task 2--------------------------------------------------------

app.get("/platform", function(req, res) { //added to reroute outdated tools.eebhub.org/platform link
    res.redirect("http://tools.eebhub.org");
});
app.get("/ideas", function(req, res) {
    res.redirect("http://eebhub.uservoice.com/forums/224458-general");
});
app.get("/weather", function(req, res) {
    res.redirect("http://developer.eebhub.org/weather.html");
});
app.get("/graphics", function(req, res) {
    res.redirect("http://eebhub.minus.com/");
});
app.get("/inspiration", function(req, res) {
    res.redirect("http://eebhub.minus.com/uploads");
});
app.get("/software", function(req, res) {
    res.redirect("http://software.buildsci.us/");
});
app.get("/infrastructure", function(req, res) {
    res.redirect("https://www.lucidchart.com/documents/edit/4a52-bee4-519e6f3c-9e75-655c0a009c81");
});
app.get("/integration", function(req, res) {
    res.redirect("https://skydrive.live.com/view.aspx?resid=16B20B2C9752FBFF!202&app=PowerPoint");
});
app.get("/code", function(req, res) {
    res.redirect("https://github.com/eebhub/platform/tree/master");
});
app.get("/files", function(req, res) {
    res.redirect("http://developer.eebhub.org/");
});
app.get("/variables", function(req, res) {
    res.redirect("http://www1.eere.energy.gov/buildings/commercial/bedes.html");
});
app.get("/database", function(req, res) {
    res.redirect("https://docs.google.com/document/d/1sL0Km4AzIGoDF-OWU3EBOFI0MIibu1fmum5VHNVsayQ/edit?usp=sharing");
});
app.get("/game", function(req, res) {
    res.redirect("http://rmt.eebhub.org/game/");
});
app.get("/vision", function(req, res) {
    res.redirect("http://simulation.eebhub.org");
});
app.get("/license", function(req, res) {
    res.redirect("https://github.com/eebhub/platform/blob/master/LICENSE");
});
app.get("/disclaimer", function(req, res) {
    res.redirect("https://github.com/eebhub/platform/blob/master/ACKNOWLEDGEMENT_DISCLAIMER");
});
app.get("/wiki", function(req, res) {
    res.redirect("https://github.com/eebhub/platform/wiki");
});
app.get("/developers", function(req, res) {
    res.redirect("http://developer.eebhub.org");
});
// app.get("/presentation", function (req, res) {
//     res.redirect("https://skydrive.live.com/redir?resid=16B20B2C9752FBFF%21214");
// });
app.get("/measures", function(req, res) {
    res.redirect("https://docs.google.com/document/d/1wrO0552T2dODzvKNWTP_CsDHKaudnBGs4ulwSbsDx6w/edit?usp=sharing");
});
app.get("/meetings", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WGVwSjNhaVdMeHM&usp=sharing");
});
app.get("/meeting", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WGVwSjNhaVdMeHM&usp=sharing");
});
app.get("/links", function(req, res) {
    res.redirect("https://docs.google.com/spreadsheet/ccc?key=0AmpmAq6B1uv_dEZRVDBKZFZxWFQ5VVFvNXJmT3NkeFE&usp=sharing");
});
app.get("/presentations", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WGVwSjNhaVdMeHM&usp=sharing");
});
app.get("/reports", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B5baO1rS2pjeUkJKVTFRNC1DQ00&usp=sharing");
});
app.get("/weekly", function(req, res) {
    res.redirect("https://docs.google.com/document/d/1nCjCd7SVIq3rUR3QBrX5m0WqBQF6P8hqfVrY--DpqtI/edit");
});
app.get("/members", function(req, res) {
    res.redirect("https://docs.google.com/spreadsheet/ccc?key=0AmpmAq6B1uv_dEthUjdWLS1tNjZmLWJOTTFPbVhGamc&usp=sharing");
});
app.get("/comments", function(req, res) {
    res.redirect("http://eebhubsimulation.buildsci.us/");
});
app.get("/feedback", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WVExS2lGUnBRajA&usp=drive_web");
});
app.get("/focusgroup", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WVExS2lGUnBRajA&usp=drive_web");
});
app.get("/engagement", function(req, res) {
    res.redirect("https://drive.google.com/folderview?id=0B2pmAq6B1uv_WVExS2lGUnBRajA&usp=drive_web");
});
app.get("/mockup", function(req, res) {
    res.redirect("https://moqups.com/mgd165/J5BYH3V5");
});
app.get("/mockups", function(req, res) {
    res.redirect("https://moqups.com/mgd165/J5BYH3V5");
});
app.get("/documentation", function(req, res) {
    res.redirect("https://drive.google.com/file/d/0B2pmAq6B1uv_alZBTmhxaDBiR2s/edit?usp=sharing");
});
app.get("/servers", function(req, res) {
    res.redirect("https://www.lucidchart.com/documents/edit/4a52-bee4-519e6f3c-9e75-655c0a009c81");
});
app.get("/levels", function(req, res) {
    res.redirect("http://www.gliffy.com/go/publish/4706415");
});
app.get("/tiers", function(req, res) {
    res.redirect("https://docs.google.com/spreadsheet/ccc?key=0AmpmAq6B1uv_dGVRcTBnX2ZSSmtRZjdEOFc5cFhfb2c&usp=sharing");
});
app.get("/inputs", function(req, res) {
    res.redirect("https://docs.google.com/spreadsheet/ccc?key=0AmpmAq6B1uv_dGVRcTBnX2ZSSmtRZjdEOFc5cFhfb2c&usp=sharing");
});
app.get("/datastandard", function(req, res) {
    res.redirect("http://www1.eere.energy.gov/buildings/commercial/bedes.html");
});
app.get("/data1", function(req, res) {
    res.redirect("https://docs.google.com/spreadsheet/ccc?key=0AmpmAq6B1uv_dGVRcTBnX2ZSSmtRZjdEOFc5cFhfb2c&usp=sharing");
});
app.get("/data2", function(req, res) {
    res.redirect("https://docs.google.com/document/d/1sL0Km4AzIGoDF-OWU3EBOFI0MIibu1fmum5VHNVsayQ/edit?usp=sharing");
});
app.get("/software1", function(req, res) {
    res.redirect("https://www.lucidchart.com/documents/edit/4a52-bee4-519e6f3c-9e75-655c0a009c81");
});
app.get("/software2", function(req, res) {
    res.redirect("http://www.gliffy.com/go/publish/4706415");
});
app.get("/software3", function(req, res) {
    res.redirect("https://skydrive.live.com/redir?resid=16B20B2C9752FBFF%21228");
});
app.get("/software4", function(req, res) {
    res.redirect("https://skydrive.live.com/redir?resid=16B20B2C9752FBFF%21229");
});
app.get("/software5", function(req, res) {
    res.redirect("https://skydrive.live.com/view.aspx?resid=16B20B2C9752FBFF!202&app=PowerPoint");
});

// Google Analytics
app.get("/geckoboard", function (req, res) {
    res.redirect("https://eebhub.geckoboard.com/dashboards/7D68F4410328D3FB");
});


//ReRoutes / ReDirects / Easy Links for Task 3--------------------------------------------------------

app.get("/controls", function(req, res) {
    res.redirect("http://67.102.239.250:8282/");
});
app.get("/monitoring", function(req, res) {
    res.redirect("http://cloud.cdhenergy.com/bldg101/");
});
app.get("/building101", function(req, res) {
    res.redirect("http://cloud.cdhenergy.com/bldg101/");
});
app.get("/harvestgrill", function(req, res) {
    res.redirect("http://cloud.cdhenergy.com/harvest_grill/");
});
app.get("/building489", function(req, res) {
    res.redirect("http://cloud.cdhenergy.com/bldg489/");
});
app.get("/montgomeryplaza", function(req, res) {
    res.redirect("http://cloud.cdhenergy.com/1mp/#display_options");
});
app.get("/dashboard", function(req, res) {
    res.redirect("http://128.118.67.231:8888/dglux/");
});
app.get("/piserversharepoint", function(req, res) {
    res.redirect("http://128.118.67.245/SitePages/Home.aspx");
});
app.get("/piservercharts", function(req, res) {
    res.redirect("http://128.118.67.245:81/coresight/#");
});
app.get("/piserverdashboard", function(req, res) {
    res.redirect("http://eebcmu.coeaccess.psu.edu:85/PIsystemV0.0/IEQ.php?floor=1");
});
//End of Easy Links -------------------------------------------------------------------------------------

//Server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});