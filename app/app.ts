import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Events, Platform, Nav, MenuController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {ConferenceData} from './providers/conference-data';
import {UserData} from './providers/user-data';
import {TweetShare} from './providers/tweet-share';
import {AccountPage} from './pages/account/account';
import {TabsPage} from './pages/tabs/tabs';
import {SpeakerListWebPage} from './pages/speaker-list-web/speaker-list-web';
import {LoginPage} from './pages/login/login';
import {SignupPage} from './pages/signup/signup';
import {TutorialPage} from './pages/tutorial/tutorial';

import * as firebase from 'firebase';

interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
}

@Component({
  templateUrl: 'build/app.html'
})
class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageObj[] = [
    { title: 'Schedule', component: TabsPage, icon: 'calendar' },
    { title: 'Speakers', component: TabsPage, index: 1, icon: 'contacts' },
    { title: 'Map', component: TabsPage, index: 2, icon: 'map' },
    { title: 'About', component: TabsPage, index: 3, icon: 'information-circle' },
  ];
  loggedInPages: PageObj[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'Logout', component: TabsPage, icon: 'log-out' }
  ];
  loggedOutPages: PageObj[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Signup', component: SignupPage, icon: 'person-add' }
  ];
  rootPage: any = TabsPage;
  altrootPage: any = SpeakerListWebPage;

  constructor(
    private events: Events,
    private userData: UserData,
    private menu: MenuController,
    platform: Platform,
    confData: ConferenceData
  ) {
    var config = {
      apiKey: "AIzaSyCa5rSBIleu6RdR8J2oi__kVhFHvqaofW4",
      authDomain: "agileafricaconf.firebaseapp.com",
      databaseURL: "https://agileafricaconf.firebaseio.com",
      storageBucket: "agileafricaconf.appspot.com",
    };

    firebase.initializeApp(config);

    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    // load the conference data
    confData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === 'true');
    });

    this.listenToLoginEvents();
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component);
    }

    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.userData.logout();
      }, 1000);
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }
}


// Pass the main App component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument, see the docs for
// more ways to configure your app:
// http://ionicframework.com/docs/v2/api/config/Config/
// Place the tabs on the bottom for all platforms
// See the theming docs for the default values:
// http://ionicframework.com/docs/v2/theming/platform-specific-styles/

ionicBootstrap(ConferenceApp, [ConferenceData, UserData, TweetShare], {
  tabbarPlacement: 'bottom',
  prodMode : true
});
