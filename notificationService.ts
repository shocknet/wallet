import { NativeModules } from 'react-native';

const { notificationService } = NativeModules;

notificationService.LogT = (s:string) => notificationService.Log("TESTING",s) 

export default notificationService;

/*
import notificationService from '../../notificationService'


 <View >
        <TouchableOpacity  onPress={() => notificationService.startService("swagman yo")}>
          <Text >Start</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => notificationService.stopService()}>
          <Text >Stop</Text>
        </TouchableOpacity>
      </View>
      */