import ActionFactory from './actionfactory';
import { bindActionCreators } from 'redux';

//按名称存储action
let actionPropsSign = {};
//按名称存储action日志级别
let actionLogsSign = {};

/**
 * 事件注入层
 */
export default class Action {
	/**
	 * action修饰器,处理整个action层存入事件工厂
	 * @param actionName(事件层名称)
	 * @return target
	 */
	static action = (actionName = '') => target => {
		if (!actionName) {
			return target;
		}

		if (!target || typeof target != 'function') {
			throw new Error(`target Invalid value of type ${typeof target} for action.`);
		}

		//actions actionName下,所有响应事件
		let actions = {};
		for (let key in target) {
			if (actionPropsSign[key]) {
				//提取actions
				actions[actionPropsSign[key]] = (...args) => dispatch => {
					//埋入日志输出点,便于使用人员定位事件触发
					if (actionLogsSign[key]) {
						switch (actionLogsSign[key]) {
							case 'waring':
								console.warn(`actionFunName:${actionPropsSign[key]} actionParams:${JSON.stringify(...args)}`);
								break;
							case 'log':
								console.log(`actionFunName:${actionPropsSign[key]} actionParams:${JSON.stringify(...args)}`);
								break;
							case 'error':
								console.error(`actionFunName:${actionPropsSign[key]} actionParams:${JSON.stringify(...args)}`);
								break;
							default:
								break;
						}
					}
					target[key](...args)(dispatch);
				};
			}
		}

		//按名称将事件存入ActionFactory
		ActionFactory.initAction(actionName, actions);

		return target;
	};

	/**
	 * actionProps修饰器,按名称录入action
	 * @param actionFunName(事件名称)
	 * @return target
	 */
	static actionProps = (actionFunName = '') => (target, key) => {
		if (!target || typeof target != 'function') {
			throw new Error(`target Invalid value of type ${typeof target} for actionProps.`);
		}

		if (!key || typeof key != 'string') {
			throw new Error(`key Invalid value of type ${typeof key} for actionProps.`);
		}

		//按名称录入action
		actionPropsSign[key] = actionFunName;

		return target;
	};

	/**
	 * actionLogs修饰器,按名称录入日志级别
	 * @param level(日志级别)
	 * @return target
	 */
	static actionLogs = level => (target, key) => {
		if (!target || typeof target != 'function') {
			throw new Error(`target Invalid value of type ${typeof target} for actionLogs.`);
		}

		if (!key || typeof key != 'string') {
			throw new Error(`key Invalid value of type ${typeof key} for actionLogs.`);
		}

		//按名称录入日志级别
		actionLogsSign[key] = level;

		return target;
	};

	/**
	 * actionInjection修饰器,按名称反向注入事件到reactDom
	 * @param actionName(事件名称)
	 * @return target
	 */
	static actionInjection = (actionName = '') => target => {
		if (!target || typeof target != 'function') {
			throw new Error(`target Invalid value of type ${typeof target} for actionInjection.`);
		}

		if (!actionName) {
			return target;
		}

		let actions = ActionFactory.getAction(actionName);

		//按名称反向注入事件到reactDom的mapDispatchToProps,供connectstore使用
		target.mapDispatchToProps = dispatch => {
			let mapDispatchToPropsParams = {};

			for (let key in actions) {
				if (actions[key]) {
					mapDispatchToPropsParams[key] = bindActionCreators(actions[key], dispatch);
				}
			}
			return mapDispatchToPropsParams;
		};

		return target;
	};
}
