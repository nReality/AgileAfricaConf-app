import {Component, ViewChild} from '@angular/core';
import {App, Page, Modal, Alert, NavController, ItemSliding, List} from 'ionic-angular';
import {ConferenceData} from '../../providers/conference-data';
import {UserData} from '../../providers/user-data';
import {ScheduleFilterPage} from '../schedule-filter/schedule-filter';
import {SessionDetailPage} from '../session-detail/session-detail';


@Component({
  templateUrl: 'build/pages/schedule/schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', {read: List}) scheduleList: List;

  dayIndex = 0;

  queryText = '';
  segment = 'all';
  excludeTracks = [];
  excludeLocations = [];
  locations: Array<{name: string,hide: boolean}> = [];
  excludeDays = [];
  flatGroups = [];

  constructor(
    private app: App,
    private nav: NavController,
    private confData: ConferenceData,
    private user: UserData
  ) {

    this.confData.data.locations.forEach(locationName => {

          this.locations.push({
            name: locationName,
            hide: false
          });
    });

  }
  toggleLocation(locationName){
    this.excludeLocations = [];
    this.locations.forEach(location => {
      if (location.name == locationName){
        location.hide = !location.hide;
      }
      if (location.hide){
        this.excludeLocations.push(location.name);
      }
    });
    this.updateSchedule();
  }

  toggleDay(dateString){
    this.excludeDays = [];
    this.confData.data.schedule.forEach(day => {
      if (day.date == dateString){
        day.hide = !day.hide;
      }
      if (day.hide){
        this.excludeDays.push(day.date);
      }
    });
    this.updateSchedule();
  }
  ionViewDidEnter() {
    this.app.setTitle('Schedule');
  }

  ngAfterViewInit() {
    this.updateSchedule();
  }


  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.excludeLocations, this.excludeDays, this.segment).then(data => {
      this.flatGroups = data;
    });
  }

  presentFilter() {
    let modal = Modal.create(ScheduleFilterPage, this.excludeTracks);
    this.nav.present(modal);

    modal.onDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData) {
    // go to the session detail page
    // and pass in the session data
    this.nav.push(SessionDetailPage, sessionData);
  }

  addFavorite(slidingItem: ItemSliding, sessionData) {

    if (this.user.hasFavorite(sessionData.name)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = Alert.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      this.nav.present(alert);
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData, title) {
    let alert = Alert.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    this.nav.present(alert);
  }

  locationNoSpaces(location){
    return (!location) ? '' : location.replace(/ /g, '');
  }
}
