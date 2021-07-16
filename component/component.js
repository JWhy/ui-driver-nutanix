/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
import NodeDriver from 'shared/mixins/node-driver';

// do not remove LAYOUT, it is replaced at build time with a base64 representation of the template of the hbs template
// we do this to avoid converting template to a js file that returns a string and the cors issues that would come along with that
const LAYOUT;
/*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/


/*!!!!!!!!!!!GLOBAL CONST START!!!!!!!!!!!*/
// EMBER API Access - if you need access to any of the Ember API's add them here in the same manner rather then import them via modules, since the dependencies exist in rancher we dont want to expor the modules in the amd def
const computed     = Ember.computed;
const get          = Ember.get;
const set          = Ember.set;
const alias        = Ember.computed.alias;
const service      = Ember.inject.service;

const defaultRadix = 10;
const defaultBase  = 1024;
/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/



/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(NodeDriver, {
  driverName: '%%DRIVERNAME%%',
  config:     alias('model.%%DRIVERNAME%%Config'),
  app:        service(),
  needLogin: true,
  init() {
    // This does on the fly template compiling, if you mess with this :cry:
    const decodedLayout = window.atob(LAYOUT);
    const template      = Ember.HTMLBars.compile(decodedLayout, {
      moduleName: 'nodes/components/driver-%%DRIVERNAME%%/template'
    });
    set(this,'layout', template);

    this._super(...arguments);
  },
  /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/
  actions: {
    getData() {
      this.set('gettingData', true);
      let that = this;
      that.apiRequest(
        "/api/nutanix/v3/groups",
        '{"entity_type":"category","grouping_attribute":"abac_category_key","group_sort_attribute":"name","group_count":64,"group_attributes":[{"attribute":"name","ancestor_entity_type":"abac_category_key"},{"attribute":"immutable","ancestor_entity_type":"abac_category_key"},{"attribute":"cardinality","ancestor_entity_type":"abac_category_key"},{"attribute":"description","ancestor_entity_type":"abac_category_key"}],"group_member_count":1000,"group_member_offset":0,"group_member_sort_attribute":"value","group_member_attributes":[{"attribute":"name"},{"attribute":"value"},{"attribute":"description"},{"attribute":"immutable"},{"attribute":"cardinality"}],"query_name":"prism:CategoriesQueryModel","filter_criteria":"name==.*,value==.*"}'
      ).then((res) => {
        this.set('gettingData', false);
        console.log(res);
      }).catch(err => {
        this.set('gettingData', false);
        console.log(err);
      });
    }
  },
  // Write your component here, starting with setting 'model' to a machine with your config populated
  bootstrap: function() {
    // bootstrap is called by rancher ui on 'init', you're better off doing your setup here rather then the init function to ensure everything is setup correctly
    let config = this.get('store').createRecord({
      type: '%%DRIVERNAME%%Config',
      username: "admin",
      vmCpus: 1,
      vmCores: 1,
      vmMem: 1024,
      vmImage: "docker-img",
      vmNetwork: "default",
    });

    set(this, 'model.%%DRIVERNAME%%Config', config);
  },
  apiRequest(path, data) {
    const apiUrl = this.get('model.%%DRIVERNAME%%Config.endpoint');
    const apiUser = this.get('model.%%DRIVERNAME%%Config.username');
    const apiPassword = this.get('model.%%DRIVERNAME%%Config.password');

    const apiAuth = btoa(apiUser + ":" + apiPassword);

    return fetch(apiUrl + path, {
      method: (!!data) ? "POST" : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + apiAuth,
      },
      body: data
    }).then(res => res.ok ? res.json() : Promise.reject(res.json()));
  },
  // Add custom validation beyond what can be done from the config API schema
  validate() {
    // Get generic API validation errors
    this._super();
    var errors = get(this, 'errors')||[];
    if ( !get(this, 'model.name') ) {
      errors.push('Name is required');
    }

    // Add more specific errors

    // Check something and add an error entry if it fails:
    if ( parseInt(get(this, 'config.vmMem'), defaultRadix) < defaultBase ) {
      errors.push('Memory Size must be at least 1024 MB');
    }

    // Set the array of errors for display,
    // and return true if saving should continue.
    if ( get(errors, 'length') ) {
      set(this, 'errors', errors);
      return false;
    } else {
      set(this, 'errors', null);
      return true;
    }
  },

  // Any computed properties or custom logic can go here
});
